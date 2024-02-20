/**
 * @file Parser
 * @module docast-util-from-docs/parser
 */

import type {
  BlockTag,
  Comment,
  Content,
  Description,
  DocastNode,
  FlowContent,
  InlineTag,
  Position,
  Root,
  TypeExpression
} from '@flex-development/docast'
import {
  at,
  constant,
  defaults,
  equal,
  fallback,
  flat,
  includes,
  isNIL,
  isNumber,
  isString,
  noop,
  sift,
  template,
  trim,
  type Assign,
  type Fn,
  type Nilable,
  type Optional
} from '@flex-development/tutils'
import { ok } from 'devlop'
import type {
  Break,
  Code,
  Parents as MdastParent,
  Root as MdastRoot,
  Paragraph,
  Text
} from 'mdast'
import {
  fromMarkdown,
  type CompileContext,
  type Token as MToken
} from 'mdast-util-from-markdown'
import { codes, types } from 'micromark-util-symbol'
import type {
  Code as CharacterCode,
  Effects,
  State,
  TokenizeContext
} from 'micromark-util-types'
import type { AssertionError } from 'node:assert'
import { u } from 'unist-builder'
import { source } from 'unist-util-source'
import { CONTINUE, EXIT, visit } from 'unist-util-visit'
import type { VFile } from 'vfile'
import { TokenKind } from './enums'
import type { Options, Token } from './interfaces'
import Lexer from './lexer'
import type { UncommentReplacer } from './types'

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
   * Document being parsed.
   *
   * @protected
   * @readonly
   * @instance
   * @member {string} document
   */
  protected readonly document: string

  /**
   * Document tokenizer.
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
   * Syntax tree representing source file.
   *
   * @see {@linkcode Root}
   *
   * @protected
   * @readonly
   * @instance
   * @member {Root} tree
   */
  protected readonly tree: Root

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

    this.lexer = new Lexer(source)
    this.options = Object.freeze(defaults(options, { codeblocks: 'example' }))
    this.tree = u('root', { children: [] })

    this.document = this.lexer.document
    this.lexer.tokenize()
  }

  /**
   * Get the last block tag node in the syntax tree.
   *
   * @see {@linkcode BlockTag}
   *
   * @protected
   *
   * @return {BlockTag} Last block tag node in tree
   * @throws {AssertionError} If last block tag node does not exist or is
   * invalid and `development` condition is used when importing parser module
   */
  protected get lastBlockTag(): BlockTag {
    /**
     * Last block tag node.
     *
     * @var {Optional<BlockTag>} blockTag
     */
    let blockTag: Optional<BlockTag>

    // get last block tag node
    visit(this.lastComment, 'blockTag', node => {
      blockTag = node
      return EXIT
    }, true)

    ok(blockTag, 'expected last block tag node')
    return blockTag
  }

  /**
   * Get the last comment node in the syntax tree.
   *
   * @see {@linkcode Comment}
   *
   * @protected
   *
   * @return {Comment} Last comment node in tree
   * @throws {AssertionError} If last comment node does not exist or is invalid
   * and `development` condition is used when importing parser module
   */
  protected get lastComment(): Comment {
    /**
     * Last comment node.
     *
     * @var {Optional<Comment>} comment
     */
    let comment: Optional<Comment>

    // get last comment node
    visit(this.tree, 'comment', node => {
      comment = node
      return EXIT
    }, true)

    ok(comment, 'expected last comment node')
    return comment
  }

  /**
   * Get the last inline tag node in the syntax tree.
   *
   * @see {@linkcode InlineTag}
   *
   * @protected
   *
   * @return {InlineTag} Last inline tag node in tree
   * @throws {AssertionError} If last inline tag node or parent does not exist
   * and `development` condition is used when importing parser module
   */
  protected get lastInlineTag(): InlineTag {
    /**
     * Last inline tag node.
     *
     * @var {Optional<InlineTag>} inlineTag
     */
    let inlineTag: Optional<InlineTag>

    // get last inline tag node
    visit(this.lastInlineTagParent, 'inlineTag', node => {
      inlineTag = node
      return EXIT
    }, true)

    // assert docast inline tag node
    ok(inlineTag, 'expected last inline tag node')
    ok('name' in inlineTag, 'expected inline tag node')
    ok('tag' in inlineTag, 'expected inline tag node')
    ok('value' in inlineTag, 'expected inline tag node')

    return inlineTag
  }

  /**
   * Get the last inline tag parent node in the syntax tree.
   *
   * @see {@linkcode FlowContent}
   *
   * @protected
   *
   * @return {FlowContent} Last inline tag parent in tree
   * @throws {AssertionError} If last inline tag parent does not exist and
   * `development` condition is used when importing parser module
   */
  protected get lastInlineTagParent(): FlowContent {
    /**
     * Last inline tag parent.
     *
     * @var {Optional<FlowContent>} parent
     */
    let parent: Optional<FlowContent>

    // get last inline tag parent
    visit(this.lastComment, node => {
      switch (node.type) {
        case TokenKind.BLOCK_TAG:
        case TokenKind.DESCRIPTION:
          parent = node
          return EXIT
        default:
          return CONTINUE
      }
    }, true)

    ok(parent, 'expected last inline tag parent')
    return parent
  }

  /**
   * Assert `token` is of `kind`.
   *
   * @protected
   *
   * @template {TokenKind} K - Token kind
   *
   * @param {K} kind - Token kind
   * @param {Token} token - Token to check
   * @return {void} Nothing; throws if `token` is invalid and `development`
   * condition is used when importing lexer module
   */
  protected assert<K extends TokenKind>(
    kind: K,
    token: Token
  ): asserts token is Assign<Token, { kind: K }> {
    ok(token, 'expected token')
    ok(token.kind === kind, `expected ${kind} token`)
    return void token
  }

  /**
   * Handle a `blockTag` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   */
  protected blockTag(token: Token): void {
    this.assert(TokenKind.BLOCK_TAG, token)

    /**
     * Block tag node.
     *
     * @const {BlockTag} node
     */
    const node: BlockTag = u(token.kind, {
      children: [],
      name: '',
      position: { end: token.end, start: token.start },
      tag: ''
    })

    return void this.lastComment.children.push(node)
  }

  /**
   * Handle a `blockTagId` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   * @throws {AssertionError} If block tag id cannot be extracted from source
   * file and `development` condition is used when importing parser module
   */
  protected blockTagId(token: Token): void {
    this.assert(TokenKind.BLOCK_TAG_ID, token)

    /**
     * Last block tag node.
     *
     * @const {BlockTag} node
     */
    const node: BlockTag = this.lastBlockTag

    // set tag metadata
    node.tag = source(this.document, { end: token.end, start: token.start })!
    ok(node.tag, 'expected block tag id')
    node.name = node.tag.slice(1)

    return void token
  }

  /**
   * Handle a `blockTagText` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   * @throws {AssertionError} If block tag text cannot be extracted from source
   * file and `development` condition is used when importing parser module
   */
  protected blockTagText(token: Token): void {
    this.assert(TokenKind.BLOCK_TAG_TEXT, token)

    /**
     * Last block tag node.
     *
     * @const {BlockTag} node
     */
    const node: BlockTag = this.lastBlockTag

    /**
     * Raw block tag text position.
     *
     * @const {Position} position
     */
    const position: Position = { end: token.end, start: token.start }

    /**
     * Raw block tag text.
     *
     * @const {Optional<string>} raw
     */
    const raw: Optional<string> = source(this.document, position)

    // assert raw block tag text
    ok(isString(raw), 'expected raw block tag text')

    // add markdown children
    if (trim(raw)) {
      /**
       * Markdown children.
       *
       * @const {Exclude<Content, DocastNode>[]} children
       */
      const children: Exclude<Content, DocastNode>[] = this.markdown(
        node,
        raw,
        position
      )

      // @ts-expect-error ts(2345) type expression are parsed before block tag
      // text, so the corresponding child node is already positioned correctly
      this.lastBlockTag.children.push(...children)
    }

    return void token
  }

  /**
   * Handle a `comment` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   */
  protected comment(token: Token): void {
    this.assert(TokenKind.COMMENT, token)

    /**
     * Comment node.
     *
     * @const {Comment} node
     */
    const node: Comment = u(token.kind, {
      children: [],
      code: null,
      position: { end: token.end, start: token.start }
    })

    return void this.tree.children.push(node)
  }

  /**
   * Handle a `description` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   */
  protected description(token: Token): void {
    this.assert(TokenKind.DESCRIPTION, token)

    /**
     * Description node position.
     *
     * @const {Position} position
     */
    const position: Position = { end: token.end, start: token.start }

    /**
     * Raw description.
     *
     * @const {Optional<string>} raw
     */
    const raw: Optional<string> = source(this.document, position)

    // assert raw description
    ok(isString(raw), 'expected raw description')

    /**
     * Description node.
     *
     * @const {Description} node
     */
    const node: Description = u(token.kind, {
      children: [],
      position
    })

    // parse markdown
    node.children = this.markdown(node, raw, position)

    return void this.lastComment.children.push(node)
  }

  /**
   * Handle an `inlineTag` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   */
  protected inlineTag(token: Token): void {
    this.assert(TokenKind.INLINE_TAG, token)

    /**
     * Inline tag node position.
     *
     * @const {Position} position
     */
    const position: Position = { end: token.end, start: token.start }

    return void visit(this.lastInlineTagParent, token.kind, (
      n: InlineTag,
      index?: number,
      parent?: Optional<BlockTag | Description | MdastParent>
    ): typeof CONTINUE | typeof EXIT => {
      /* c8 ignore next */ if (!equal(n.position, position)) return CONTINUE
      ok(isNumber(index), 'expected indexed node')
      ok(parent, 'expected parent')

      // replace mdast node with docast node
      parent.children.splice(index, 1, u(token.kind, {
        name: '',
        position,
        tag: '',
        value: ''
      }))

      return EXIT
    })
  }

  /**
   * Handle an `inlineTagId` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   * @throws {AssertionError} If inline tag id cannot be extracted from source
   * file and `development` condition is used when importing parser module
   */
  protected inlineTagId(token: Token): void {
    this.assert(TokenKind.INLINE_TAG_ID, token)

    /**
     * Last inline tag node.
     *
     * @const {InlineTag} node
     */
    const node: InlineTag = this.lastInlineTag

    // set tag metadata
    node.tag = source(this.document, { end: token.end, start: token.start })!
    ok(node.tag, 'expected inline tag id')
    node.name = node.tag.slice(1)

    return void token
  }

  /**
   * Handle an `inlineTagValue` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   * @throws {AssertionError} If inline tag value cannot be extracted from
   * source file and `development` condition is used when importing parser
   * module
   */
  protected inlineTagValue(token: Token): void {
    this.assert(TokenKind.INLINE_TAG_VALUE, token)

    /**
     * Last inline tag node.
     *
     * @const {InlineTag} node
     */
    const node: InlineTag = this.lastInlineTag

    // set inline tag value
    node.value = source(this.document, { end: token.end, start: token.start })!
    ok(node.value, 'expected inline tag value')

    return void token
  }

  /**
   * Parse markdown.
   *
   * @see https://github.com/syntax-tree/mdast-util-from-markdown
   *
   * @protected
   *
   * @param {BlockTag | Description} node - Parent node
   * @param {string} value - Raw block tag text or raw description
   * @param {Position} position - Position of `value`
   * @return {Exclude<Content, DocastNode>[]} Markdown `node` children
   */
  protected markdown(
    node: BlockTag | Description,
    value: string,
    position: Position
  ): Exclude<Content, DocastNode>[] {
    /**
     * Block tag node names and tags, or regular expressions, matching block
     * tags that should have their text converted to {@linkcode Code} before
     * being parsed as markdown.
     *
     * @const {(RegExp | string)[]} codeblocks
     */
    const codeblocks: (RegExp | string)[] = flat(sift([
      this.options.codeblocks
    ]))

    /**
     * Convert block tag text to {@linkcode Code}?
     *
     * @const {boolean} codeblock
     */
    const codeblock: boolean = 'tag' in node && codeblocks.some(check => {
      return isString(check)
        ? includes([node.name, node.tag], check)
        : [node.name, node.tag].some(str => check.test(str))
    }) && !value.startsWith('```')

    /**
     * List, where each index is a line number (`0`-based), and each value is
     * the number of columns to shift a `mdast` node.
     *
     * @const {number[]} columns
     */
    const columns: number[] = []

    // format value as markdown
    value = this.uncomment(value, (match: string): string => {
      columns.push(columns.length ? match.length : position.start.column - 1)
      return ''
    })

    // fence block tag text to process as fenced code
    // or mark line endings to be replaced
    if (codeblock) value = template('```\n{value}\n```', { value })

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
              name: TokenKind.INLINE_TAG,

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
                    effects.exit(TokenKind.INLINE_TAG)
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
                  effects.enter(TokenKind.INLINE_TAG)
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
            [types.atxHeading]: noop,
            /**
             * Enter a hard break.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [types.hardBreakEscape](this: CompileContext, token: MToken): void {
              return void this.enter({
                data: { hard: true },
                type: 'break'
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
            [TokenKind.INLINE_TAG](this: CompileContext, token: MToken): void {
              return void this.enter(<never>{
                type: TokenKind.INLINE_TAG
              }, token)
            },
            /**
             * Enter a blank line.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [types.lineEndingBlank](this: CompileContext, token: MToken): void {
              return void this.enter({
                data: { blank: true },
                type: 'break'
              }, token)
            },
            [types.setextHeading]: noop,
            [types.setextHeadingLineSequence]: noop,
            [types.setextHeadingText]: noop
          },
          exit: {
            [types.atxHeading]: noop,
            /**
             * Exit a hard break.
             *
             * @this {CompileContext}
             *
             * @param {MToken} token - Micromark token
             * @return {void} Nothing
             */
            [types.hardBreakEscape](this: CompileContext, token: MToken): void {
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
            [TokenKind.INLINE_TAG](this: CompileContext, token: MToken): void {
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
            [types.lineEndingBlank](this: CompileContext, token: MToken): void {
              return void this.exit(token)
            },
            [types.setextHeading]: noop,
            [types.setextHeadingLineSequence]: noop,
            [types.setextHeadingText]: noop
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
                m: MdastParent | MdastParent['children'][number]
              ): typeof CONTINUE => {
                ok(m.position, 'expected non-generated node')

                /**
                 * Number of lines the node spans.
                 *
                 * @const {number} span
                 */
                const span: number = m.position.end.line - m.position.start.line

                // shift columns
                for (const [i, removed] of columns.entries()) {
                  /**
                   * Node start line.
                   *
                   * @const {number} line
                   */
                  const line: number = i + 1

                  // make start column relative to source file
                  if (m.position.start.line === line) {
                    m.position.start.column += removed
                  }

                  // make end column relative to source file
                  if (m.position.end.line === line && m.type !== 'break') {
                    m.position.end.column += removed
                  }
                }

                // make node start relative to source file
                m.position.start.line += position.start.line - 1
                m.position.start.offset = this.lexer.offset(m.position.start)

                // make node end relative to source file
                if (codeblock && m.type === 'code') {
                  m.position.end.column = position.end.column
                  m.position.end.line = position.end.line
                  m.position.end.offset = position.end.offset
                } else {
                  if (m.type === 'break') {
                    m.position.end.column = 1

                    if (m.data?.hard) {
                      m.position.end.column += m.position.start.column
                    }
                  }

                  m.position.end.line = m.position.start.line + span
                  m.position.end.offset = this.lexer.offset(m.position.end)
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
                parent?: Optional<MdastParent>
              ): number | typeof CONTINUE => {
                if (m.data?.blank) {
                  ok(m.position, 'expected non-generated node')
                  ok(isNumber(m.position.start.offset), 'expected start offset')
                  ok(isNumber(index), 'expected indexed node')
                  ok(parent, 'expected parent')
                  const { start } = m.position

                  /**
                   * Start index of raw blank line.
                   *
                   * @const {number} offset
                   */
                  const offset: number = start.offset! - start.column

                  // insert break node to complete blank line
                  parent.children.splice(index, 1, {
                    position: {
                      end: this.lexer.point(offset + 1),
                      start: this.lexer.point(offset)
                    },
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
                ok(isString(m.value), 'expected string value')

                /**
                 * Regular expression used to search for newline characters.
                 *
                 * @const {RegExp} search
                 */
                const search: RegExp = /[\n\r]/g

                // replace or remove newline characters
                if (search.test(m.value)) {
                  ok(m.position, 'expected non-generated node')
                  ok(isNumber(m.position.start.offset), 'expected start offset')
                  ok(isNumber(index), 'expected indexed node')
                  ok(parent, 'expected parent')

                  /**
                   * Previous sibling.
                   *
                   * @const {Optional<MdastParent['children'][number]>} prev
                   */
                  const prev: Optional<MdastParent['children'][number]> = at(
                    parent.children,
                    index - 1
                  )

                  // remove newline character if previous sibling is hard break,
                  // or replace newline characters with spaces
                  if (prev?.type === 'break' && prev.data?.hard) {
                    ok(/^[\n\r]/.test(m.value), 'expected newline start')
                    let { offset } = m.position.start
                    m.value = m.value.slice(1)
                    offset = this.document.indexOf(m.value, offset)
                    m.position.start = this.lexer.point(offset)
                  } else {
                    if (/[\n\r]$/.test(m.value)) {
                      m.position.end.column = 1
                      m.position.end.offset = this.lexer.offset(m.position.end)
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

    return <Exclude<Content, DocastNode>[]>tree.children
  }

  /**
   * Parse the source document to an abstract syntax tree.
   *
   * @public
   *
   * @return {Root} Docblock AST
   */
  public parse(): Root {
    /**
     * Tree transforms.
     *
     * @const {Fn<[Root], void>[]} transforms
     */
    const transforms: Fn<[tree: Root], void>[] = fallback(
      this.options.transforms,
      [],
      isNIL
    )

    /**
     * Dump paragraphs.
     *
     * @see {@linkcode Root}
     *
     * @param {Root} tree - Docblock syntax tree
     * @return {void} Nothing
     */
    const paragraphs = (tree: Root): void => {
      return void visit(tree, 'paragraph', (
        m: Paragraph,
        index?: number,
        parent?: Optional<BlockTag | Description | MdastParent>
      ): number | typeof CONTINUE => {
        ok(isNumber(index), 'expected indexed node')
        ok(parent, 'expected parent')

        switch (parent.type) {
          case 'blockTag':
          case 'listItem':
            parent.children.splice(index, 1, ...m.children)
            return index
          default:
            return CONTINUE
        }
      })
    }

    // convert tokens to docast nodes
    for (const token of this.lexer.tokens) void this[token.kind](token)

    // apply tree transforms
    transforms.unshift(paragraphs)
    for (const transform of transforms) void transform(this.tree)

    return this.tree
  }

  /**
   * Handle a `typeExpression` token.
   *
   * @protected
   *
   * @param {Token} token - Token to handle
   * @return {void} Nothing
   * @throws {AssertionError} If type expression cannot be added to parent or
   * raw type expression cannot be extracted from source file and `development`
   * condition is used when importing parser module
   */
  protected typeExpression(token: Token): void {
    this.assert(TokenKind.TYPE_EXPRESSION, token)

    // assert parent children
    ok(
      this.lastBlockTag.children.every(child => child.type !== token.kind),
      'blockTag may only contain one typeExpression node'
    )

    /**
     * Type expression node position.
     *
     * @const {Position} position
     */
    const position: Position = { end: token.end, start: token.start }

    /**
     * Raw type expression.
     *
     * @const {Optional<string>} raw
     */
    const raw: Optional<string> = source(this.document, position)

    // assert raw type expression
    ok(raw, 'expected raw type expression')

    /**
     * Type expression node.
     *
     * @const {TypeExpression} node
     */
    const node: TypeExpression = u(token.kind, {
      position,
      value: this.uncomment(raw.slice(1, -1))
    })

    return void this.lastBlockTag.children.unshift(<never>node)
  }

  /**
   * Replace comment delimiter sequences in `value`.
   *
   * @see {@linkcode UncommentReplacer}
   *
   * @protected
   *
   * @param {string} value - Value to normalize
   * @param {(UncommentReplacer | string)?} [replacer=''] - A string containing
   * the text to replace for every successful match in `value`, or a function
   * that returns the replacement text
   * @return {string} `value` with comment delimiter matches replaced
   */
  protected uncomment(
    value: string,
    replacer: UncommentReplacer | string = ''
  ): string {
    return value.replaceAll(
      /^(?:[\t ]*\*[\t ]{0,2})?/gm,
      isString(replacer) ? constant(replacer) : replacer
    )
  }
}

export default Parser
