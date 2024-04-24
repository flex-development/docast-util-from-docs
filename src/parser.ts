/**
 * @file Parser
 * @module docast-util-from-docs/parser
 */

import type {
  BlockTag,
  Comment,
  Description,
  Position,
  Root,
  TagName,
  TypeExpression
} from '@flex-development/docast'
import {
  at,
  defaults,
  fallback,
  flat,
  isNIL,
  isString,
  noop,
  sift,
  template,
  type Nilable,
  type Nullable,
  type Optional
} from '@flex-development/tutils'
import type {
  Children,
  InclusiveDescendant
} from '@flex-development/unist-util-types'
import {
  CONTINUE,
  visit,
  type VisitedParent
} from '@flex-development/unist-util-visit'
import { ok } from 'devlop'
import type {
  Break,
  Code,
  Parents as MdastParent,
  Root as MdastRoot,
  Nodes,
  Paragraph,
  RootContent,
  Text
} from 'mdast'
import {
  fromMarkdown,
  type CompileContext,
  type Token as MToken
} from 'mdast-util-from-markdown'
import { codes, types as mt } from 'micromark-util-symbol'
import type {
  Code as CharacterCode,
  Effects,
  State,
  TokenizeContext
} from 'micromark-util-types'
import {
  apply,
  expectEOF as eof,
  opt,
  rep,
  expectSingleResult as result,
  seq,
  tok,
  type Parser as P
} from 'typescript-parsec'
import type { Node, Parent } from 'unist'
import { u } from 'unist-builder'
import type { VFile } from 'vfile'
import { TokenKind as kinds, types } from './enums'
import type { Options } from './interfaces'
import Lexer from './lexer'
import Location from './location'

declare module 'mdast' {
  interface BreakData {
    blank?: Optional<boolean>
    hard?: Optional<boolean>
  }
}

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    inlineTag: 'inlineTag'
  }
}

/**
 * Docblock parser.
 *
 * @class
 */
class Parser {
  /**
   * Source document tokenizer.
   *
   * @see {@linkcode Lexer}
   *
   * @protected
   * @readonly
   * @instance
   * @member {Lexer} lexer
   */
  protected readonly lexer: Lexer

  /**
   * Parser options.
   *
   * @see {@linkcode Options}
   *
   * @protected
   * @readonly
   * @instance
   * @member {Readonly<Options>} options
   */
  protected readonly options: Readonly<Options>

  /**
   * Create a new docblock parser.
   *
   * @see {@linkcode Options}
   * @see {@linkcode VFile}
   *
   * @param {VFile | string} source - Source document or file
   * @param {Nilable<Options>?} [options] - Parser options
   */
  constructor(source: VFile | string, options?: Nilable<Options>) {
    options = fallback(options, {}, isNIL)
    options.transforms = fallback(options.transforms, [], isNIL)

    this.lexer = new Lexer(source, options)
    this.options = Object.freeze(defaults(options, { codeblocks: '@example' }))
  }

  /**
   * Get the block tag parser.
   *
   * @see {@linkcode BlockTag}
   *
   * @protected
   * @instance
   *
   * @return {P<kinds, BlockTag>} Block tag parser
   */
  protected get blockTag(): P<kinds, BlockTag> {
    return apply(seq(
      tok(kinds.tag),
      opt(this.typeExpression),
      opt(tok(kinds.markdown))
    ), ([tag, typeExpression, markdown]) => {
      /**
       * Block tag names, or regular expressions, matching block tags that
       * should have their text converted to {@linkcode Code} before being
       * parsed as markdown.
       *
       * @const {(RegExp | string)[]} codeblocks
       */
      const codeblocks: (RegExp | string)[] = flat(sift([
        this.options.codeblocks
      ]))

      return u(types.blockTag, {
        children: this.children<BlockTag>([
          ...sift([typeExpression]),
          ...this.applyMarkdown(markdown, markdown && codeblocks.some(check => {
            return isString(check)
              ? tag.text === check
              : check.test(tag.text)
          }) && !markdown.text.startsWith('`'.repeat(3)))
        ]),
        name: <TagName>tag.text,
        position: {
          end: markdown?.end ?? typeExpression?.position!.end ?? tag.end,
          start: tag.start
        }
      })
    })
  }

  /**
   * Get the comment parser.
   *
   * @see {@linkcode Comment}
   *
   * @protected
   * @instance
   *
   * @return {P<kinds, Comment>} Comment parser
   */
  protected get comment(): P<kinds, Comment> {
    return apply(seq(
      tok(kinds.opener),
      opt(this.description),
      rep(this.blockTag),
      tok(kinds.closer)
    ), ([opener, description, blockTags, closer]) => {
      return u(types.comment, {
        children: this.children<Comment>(sift([description, ...blockTags])),
        position: { end: closer.end, start: opener.start }
      })
    })
  }

  /**
   * Get the implicit description parser.
   *
   * @see {@linkcode Description}
   *
   * @protected
   * @instance
   *
   * @return {P<kinds.markdown, Description>} Implicit description parser
   */
  protected get description(): P<kinds.markdown, Description> {
    return apply(tok(kinds.markdown), token => {
      return u(types.description, {
        children: this.children<Description>(this.applyMarkdown(token)),
        position: { end: token.end, start: token.start }
      })
    })
  }

  /**
   * Get the root parser.
   *
   * @see {@linkcode Root}
   *
   * @protected
   * @instance
   *
   * @return {P<kinds, Root>} Root parser
   */
  protected get root(): P<kinds, Root> {
    return apply(rep(this.comment), children => {
      const { transforms } = this.options

      /**
       * docast.
       *
       * @const {Root}
       */
      const tree: Root = u(types.root, { children })

      /**
       * Dump paragraphs.
       *
       * @param {Root} tree - docast
       * @return {void} Nothing
       */
      const paragraphs = (tree: Root): void => {
        return void visit(tree, types.paragraph, (
          m: Paragraph,
          index?: number,
          parent?: BlockTag | VisitedParent<Root, Paragraph>
        ): number | typeof CONTINUE => {
          ok(typeof index === 'number', 'expected indexed node')
          ok(parent, 'expected parent')

          switch (parent.type) {
            case types.blockTag:
            case types.listItem:
              parent.children.splice(index, 1, ...m.children)
              return index
            default:
              return CONTINUE
          }
        })
      }

      // apply tree transforms
      for (const transform of [paragraphs, ...transforms!]) void transform(tree)

      return tree
    })
  }

  /**
   * Get the type expression parser.
   *
   * @see {@linkcode TypeExpression}
   *
   * @protected
   * @instance
   *
   * @return {P<kinds, TypeExpression>} Type expression parser
   */
  protected get typeExpression(): P<kinds, TypeExpression> {
    return apply(tok(kinds.typeExpression), token => {
      return u(types.typeExpression, {
        position: { end: token.end, start: token.start },
        value: token.text.slice(1, -1).replaceAll(/[\t ]*\*[\t ]{0,2}/g, '')
      })
    })
  }

  /**
   * Parse markdown.
   *
   * @see {@linkcode Position}
   * @see {@linkcode RootContent}
   * @see https://github.com/syntax-tree/mdast-util-from-markdown
   *
   * @public
   * @instance
   *
   * @template {RootContent} [T=RootContent] - mdast child node type
   *
   * @param {(Position & { text: string })?} [token] - Lexer token
   * @param {Nilable<boolean>?} [code] - Parse `token.text` as fenced code
   * @return {T[]} `mdast` child node array
   */
  public applyMarkdown<T extends RootContent = RootContent>(
    token?: Position & { text: string },
    code?: Nilable<boolean>
  ): T[] {
    if (!token) return []

    /**
     * Location utility.
     *
     * Facilitates conversions between positional (line and column-based) and
     * offset (range-based) locations.
     *
     * @const {Location} location
     */
    const location: Location = new Location(token.text, token.start)

    /**
     * List, where each index is a line number (`0`-based), and each value is
     * a tuple containing a line number relative to {@linkcode token.start} and
     * the number of columns to shift a `mdast` node.
     *
     * @const {[number, number][]} map
     */
    const map: [line: number, columns: number][] = []

    /**
     * Text to parse as markdown.
     *
     * @var {string} value
     */
    let value: string = token.text

    // format markdown value
    value = value.replaceAll(/^(?:[\t ]*\*[\t ]{0,2})?/gm, match => {
      map.push([
        token.start.line + map.length,
        map.length ? match.length : token.start.column - 1
      ])

      return ''
    })

    // fence value to process as fenced code
    if (code) value = template('```\n{value}\n```', { value })

    /**
     * Markdown syntax tree.
     *
     * @const {MdastRoot} tree
     */
    const tree: MdastRoot = fromMarkdown(value, {
      extensions: [
        {
          text: {
            [codes.leftCurlyBrace]: {
              /**
               * Construct name.
               */
              name: types.inlineTag,

              /**
               * Guard whether `code` can come before this construct.
               *
               * @see {@linkcode CharacterCode}
               *
               * @this {TokenizeContext}
               *
               * @param {CharacterCode} code - Previous character code
               * @return {boolean} `true` if `code` allowed before construct
               */
              previous(this: TokenizeContext, code: CharacterCode): boolean {
                return code !== codes.backslash
              },

              /**
               * Set up a state machine to process character codes.
               *
               * @see {@linkcode Effects}
               * @see {@linkcode State}
               *
               * @this {TokenizeContext}
               *
               * @param {Effects} effects - Context object to transition state
               * @param {State} ok - Success state function
               * @param {State} nok - Error state function
               * @return {State} Initial state
               */
              tokenize(
                this: TokenizeContext,
                effects: Effects,
                ok: State,
                nok: State
              ): State {
                /**
                 * Process the inside and end of (`}`) an inline tag.
                 *
                 * @param {CharacterCode} code - Character code
                 * @return {State} Next state
                 */
                const inside = (code: CharacterCode): State => {
                  effects.consume(code)

                  if (
                    code === codes.rightCurlyBrace &&
                    this.previous !== codes.backslash
                  ) {
                    effects.exit(types.inlineTag)
                    return ok
                  }

                  return inside
                }

                /**
                 * Process the beginning of an inline tag (`@`).
                 *
                 * @param {CharacterCode} code - Character code
                 * @return {Optional<State>} Next state
                 */
                function begin(code: CharacterCode): Optional<State> {
                  /* c8 ignore next 2 */ if (code !== codes.atSign) {
                    return nok(code)
                  }

                  effects.consume(code)
                  return inside
                }

                /**
                 * Process the start of an inline tag (`{`).
                 *
                 * @param {CharacterCode} code - Character code
                 * @return {State} Next state
                 */
                function start(code: CharacterCode): State {
                  effects.enter(types.inlineTag)
                  effects.consume(code)
                  return begin
                }

                return start
              }
            }
          }
        },
        ...fallback(this.options.micromarkExtensions, [], isNIL)
      ],
      mdastExtensions: [
        {
          enter: {
            [mt.atxHeading]: noop,
            /**
             * Enter a hard break.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [mt.hardBreakEscape](this: CompileContext, token: MToken): void {
              return void this.enter({
                data: { hard: true },
                type: types.break
              }, token)
            },
            /**
             * Enter an inline tag.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [types.inlineTag](this: CompileContext, token: MToken): void {
              return void this.enter(<never>{ type: types.inlineTag }, token)
            },
            /**
             * Enter a blank line.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [mt.lineEndingBlank](this: CompileContext, token: MToken): void {
              return void this.enter({
                data: { blank: true },
                type: types.break
              }, token)
            },
            [mt.setextHeading]: noop,
            [mt.setextHeadingLineSequence]: noop,
            [mt.setextHeadingText]: noop
          },
          exit: {
            [mt.atxHeading]: noop,
            /**
             * Exit a hard break.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [mt.hardBreakEscape](this: CompileContext, token: MToken): void {
              return void this.exit(token)
            },
            /**
             * Exit an inline tag.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [types.inlineTag](this: CompileContext, token: MToken): void {
              /**
               * Last node on stack.
               *
               * @var {Optional<Nodes | { type: 'fragment' }>} node
               */
              let node: Optional<Nodes | { type: 'fragment' }> = undefined

              node = this.stack.at(-1)
              ok(node, 'expected `node`')
              ok(node.type === types.inlineTag, 'expected `inlineTag` node')

              /**
               * Token text.
               *
               * @const {string} slice
               */
              const slice: string = this.sliceSerialize(token)

              /**
               * Regular expression used to parse {@linkcode slice}.
               *
               * @const {RegExp} re
               */
              const re: RegExp = /(?<tag>@(?<name>\b\S+))\s+(?<value>\S+(?=}))/

              /**
               * Token text match.
               *
               * @const {Nullable<RegExpExecArray>} match
               */
              const match: Nullable<RegExpExecArray> = re.exec(slice)

              ok(match, 'expected `match`')
              ok(match.groups, 'expected `match.groups`')
              ok(match.groups.tag, 'expected `match.groups.tag`')
              ok(match.groups.value, 'expected `match.groups.value`')

              node.name = <TagName>match.groups.tag
              node.value = match.groups.value

              return void this.exit(token)
            },
            /**
             * Exit a blank line.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [mt.lineEndingBlank](this: CompileContext, token: MToken): void {
              return void this.exit(token)
            },
            [mt.setextHeading]: noop,
            [mt.setextHeadingLineSequence]: noop,
            [mt.setextHeadingText]: noop
          },
          transforms: [
            /**
             * Node position transformer.
             *
             * @see {@linkcode MdastRoot}
             *
             * @param {MdastRoot} tree - Markdown syntax tree
             * @return {void} Nothing
             */
            (tree: MdastRoot): void => {
              return void visit(tree, (
                m: InclusiveDescendant<MdastRoot>
              ): typeof CONTINUE => {
                ok(m.position, 'expected non-generated node')

                /**
                 * Number of lines the node spans.
                 *
                 * @const {number} span
                 */
                const span: number = m.position.end.line - m.position.start.line

                // shift columns
                for (const [i, [, removed]] of map.entries()) {
                  /**
                   * Node start line.
                   *
                   * @const {number} line
                   */
                  const line: number = i + 1

                  // shift start column
                  if (m.position.start.line === line) {
                    m.position.start.column += removed
                  }

                  // shift end column of non-break nodes
                  if (m.position.end.line === line && m.type !== types.break) {
                    m.position.end.column += removed
                  }
                }

                // make node start relative to source file
                m.position.start.line += token.start.line - 1
                m.position.start.offset = location.offset(m.position.start)

                // make node end relative to source file
                if (code && m.type === types.code) {
                  m.position.end.column = token.end.column
                  m.position.end.line = token.end.line
                  m.position.end.offset = token.end.offset
                } else {
                  if (m.type === types.break) {
                    m.position.end.column = 1

                    if (m.data?.hard) {
                      m.position.end.column += m.position.start.column
                    }
                  }

                  m.position.end.line = m.position.start.line + span
                  m.position.end.offset = location.offset(m.position.end)
                }

                return CONTINUE
              })
            },

            /**
             * Insert new `break` nodes before `break` nodes that mark the end
             * of an empty line.
             *
             * @see {@linkcode MdastRoot}
             *
             * @param {MdastRoot} tree - Markdown syntax tree
             * @return {void} Nothing
             */
            (tree: MdastRoot): void => {
              return void visit(tree, 'break', (
                m: Break,
                index?: number,
                parent?: VisitedParent<MdastRoot, Break>
              ): number | typeof CONTINUE => {
                if (m.data?.blank) {
                  ok(m.position, 'expected non-generated node')
                  ok(typeof index === 'number', 'expected indexed node')
                  ok(parent, 'expected parent')

                  const { start } = m.position
                  ok(typeof start.offset === 'number', 'expected start offset')

                  /**
                   * Start index of raw blank line.
                   *
                   * @const {number} offset
                   */
                  const offset: number = start.offset - start.column

                  /**
                   * Break node position.
                   *
                   * @const {Position} position
                   */
                  const position: Position = {
                    end: location.point(offset + 1),
                    start: location.point(offset)
                  }

                  // insert break node to complete blank line
                  parent.children.splice(index, 1, {
                    position,
                    type: m.type
                  }, m)

                  return index + 2
                }

                return CONTINUE
              })
            },

            /**
             * Replace or remove newline characters in `text` nodes.
             *
             * Newline characters will be replaced if with spaces if they denote
             * the beginning a comment delimiter sequence sandwiched between
             * description or block tag content. They will be removed if they
             * are preceded by a hard break.
             *
             * @see {@linkcode MdastRoot}
             *
             * @param {MdastRoot} tree - Markdown syntax tree
             * @return {void} Nothing
             */
            (tree: MdastRoot): void => {
              return void visit(tree, 'text', (
                m: Text,
                index?: number,
                parent?: Optional<MdastParent>
              ): typeof CONTINUE => {
                ok(typeof m.value === 'string', 'expected string value')

                /**
                 * Regular expression used to search for newline characters.
                 *
                 * @const {RegExp} search
                 */
                const search: RegExp = /[\n\r]/g

                // replace or remove newline characters
                if (search.test(m.value)) {
                  ok(m.position, 'expected non-generated node')
                  ok(typeof index === 'number', 'expected indexed node')
                  ok(parent, 'expected parent')

                  const { end, start } = m.position
                  ok(typeof start.offset === 'number', 'expected start offset')

                  /**
                   * Previous sibling.
                   *
                   * @const {Optional<Children<MdastParent>[number]>} prev
                   */
                  const prev: Optional<Children<MdastParent>[number]> = at(
                    parent.children,
                    index - 1
                  )

                  // remove newline character if previous sibling is hard break,
                  // or replace newline characters with spaces
                  if (prev?.type === types.break && prev.data?.hard) {
                    ok(/^[\n\r]/.test(m.value), 'expected newline start')

                    for (const [, [line, removed]] of map.entries()) {
                      if (start.line === line) {
                        start.offset += removed
                        break
                      }
                    }

                    m.value = m.value.slice(1)
                    m.position.start = location.point(start.offset + 1)
                  } else {
                    if (/[\n\r]$/.test(m.value)) {
                      end.column = 1
                      end.offset = location.offset(end)
                    }

                    m.value = m.value.replaceAll(search, ' ')
                  }
                }

                return CONTINUE
              })
            }
          ]
        },
        ...fallback(this.options.mdastExtensions, [], isNIL)
      ]
    })

    return <T[]>tree.children
  }

  /**
   * Create a child node array.
   *
   * @see {@linkcode Children}
   * @see {@linkcode Parent}
   *
   * @protected
   * @instance
   *
   * @template {Parent} T - Parent node
   *
   * @param {Node[]} init - Array initializer
   * @return {Children<T>} New child node array
   */
  protected children<T extends Parent>(init: Node[]): Children<T> {
    return <Children<T>>init
  }

  /**
   * Parse the source document to an abstract syntax tree.
   *
   * @see {@linkcode Root}
   *
   * @public
   * @instance
   *
   * @return {Root} docast
   */
  public parse(): Root {
    return result(eof(this.root.parse(this.lexer.head)))
  }
}

export default Parser
