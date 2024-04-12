/**
 * @file Lexer
 * @module docast-util-from-docs/lexer
 */

import type { Point } from '@flex-development/docast'
import type { Optional } from '@flex-development/tutils'
import debug from 'debug'
import { ok } from 'devlop'
import type { VFile } from 'vfile'
import { TokenKind as kinds } from './enums'
import Reader from './reader'
import Token from './token'
import type { Character, CharacterMatch } from './types'

/**
 * Source document tokenizer.
 *
 * @class
 */
class Lexer {
  /**
   * Boolean indicating if lexer is inside a comment.
   *
   * @protected
   * @instance
   * @member {boolean} comment
   */
  protected comment: boolean

  /**
   * Debug logger.
   *
   * @see {@linkcode debug.Debugger}
   *
   * @protected
   * @readonly
   * @instance
   * @member {debug.Debugger} debug
   */
  protected readonly debug: debug.Debugger

  /**
   * Head token.
   *
   * @see {@linkcode Token}
   *
   * @public
   * @readonly
   * @instance
   * @member {Optional<Token>} head
   */
  public readonly head?: Optional<Token>

  /**
   * Source document reader.
   *
   * @see {@linkcode Reader}
   *
   * @protected
   * @readonly
   * @instance
   * @member {Reader} reader
   */
  protected readonly reader: Reader

  /**
   * Tail token.
   *
   * @see {@linkcode Token}
   *
   * @public
   * @readonly
   * @instance
   * @member {Optional<Token>} tail
   */
  public readonly tail?: Token | undefined

  /**
   * Token sequence.
   *
   * @see {@linkcode Token}
   *
   * @protected
   * @readonly
   * @instance
   * @member {Token[]} tokens
   */
  protected readonly tokens: Token[]

  /**
   * Create a new document tokenizer.
   *
   * @see {@linkcode VFile}
   *
   * @param {VFile | string} source - Source document or file
   */
  constructor(source: VFile | string) {
    this.comment = false
    this.debug = debug('docast-util-from-docs:lexer')
    this.reader = new Reader(source)
    this.tokens = []

    this.head = this.tokenize()
    this.tail = this.tokens.at(-1)
  }

  /**
   * Regular expression matching comment closers.
   *
   * @protected
   * @instance
   *
   * @return {RegExp} Comment closer rule
   */
  protected get closer(): RegExp {
    return /^\*\//
  }

  /**
   * Regular expression matching comment delimiters.
   *
   * @protected
   * @instance
   *
   * @return {RegExp} Comment delimiter rule
   */
  protected get delimiter(): RegExp {
    return /^\*/
  }

  /**
   * Regular expression matching markdown.
   *
   * @protected
   * @instance
   *
   * @return {RegExp} Markdown rule
   */
  protected get markdown(): RegExp {
    return /^(?!(?:\*\/)|(?:\*\s)|(?:@\S+\b)|(?:{[^@].*?}))\S.+?(?=(?:[\t\n\r ]*\*\/)|(?:[\t\n\r *]*\*[\t ]*(?<!{)@\b\S+))/s
  }

  /**
   * Regular expression matching comment openers.
   *
   * @protected
   * @instance
   *
   * @return {RegExp} Comment opener rule
   */
  protected get opener(): RegExp {
    return /^\/\*{2}/
  }

  /**
   * Lexer rules.
   *
   * @see {@linkcode kinds}
   *
   * @protected
   * @instance
   *
   * @return {ReadonlyArray<[boolean, RegExp, kinds]>} Lexer rules array
   */
  protected get rules(): readonly [boolean, RegExp, kinds][] {
    return Object.freeze([
      [true, this.opener, kinds.opener],
      [true, this.tag, kinds.tag],
      [true, this.typeExpression, kinds.typeExpression],
      [true, this.closer, kinds.closer],
      [false, this.delimiter, kinds.delimiter],
      [false, this.whitespace, kinds.whitespace],
      [true, this.markdown, kinds.markdown]
    ])
  }

  /**
   * Regular expression matching tag names.
   *
   * @protected
   * @instance
   *
   * @return {RegExp} Tag name rule
   */
  protected get tag(): RegExp {
    return /^@\b\S+/
  }

  /**
   * Regular expression matching type expressions.
   *
   * @protected
   * @instance
   *
   * @return {RegExp} Type expression rule
   */
  protected get typeExpression(): RegExp {
    return /^{[^@].*?}?}/s
  }

  /**
   * Regular expression matching whitespace.
   *
   * @protected
   * @instance
   *
   * @return {RegExp} Whitespace rule
   */
  protected get whitespace(): RegExp {
    return /^\s/
  }

  /**
   * Consume a character.
   *
   * @see {@linkcode Character}
   *
   * @protected
   * @instance
   *
   * @param {Character} char - Character to consume
   * @return {void} Nothing
   */
  protected consume(char: Character): void {
    ok(char === this.reader.char, 'expected `char` to equal `reader.char`')
    this.debug('consume: `%s`\nnow: %o', char, this.now())
    return void this.reader.read()
  }

  /**
   * Open a new token.
   *
   * @see {@linkcode Token}
   *
   * @protected
   * @instance
   *
   * @param {Token['kind']} kind - Token kind
   * @param {Token['text']} text - Token text
   * @return {Token} Open token
   */
  protected enter(kind: kinds, text: Token['text']): Token {
    /**
     * New token.
     *
     * @const {Token} token
     */
    const token: Token = new Token(kind, {
      end: this.reader.point(-1),
      start: this.now(),
      text
    })

    this.debug('enter: `%s`', token.kind)
    if (token.kind === kinds.opener) this.comment = true
    if (this.tokens.length) this.tokens.at(-1)!.next = token
    this.tokens.push(token)

    return token
  }

  /**
   * Close an open token.
   *
   * @see {@linkcode Token}
   * @see {@linkcode kinds}
   *
   * @protected
   * @instance
   *
   * @param {kinds} kind - Token kind
   * @return {Token} Closed token
   */
  protected exit(kind: kinds): Token {
    ok(typeof kind === 'string', 'expected `kind` to be a string')
    ok(kind.length > 0, 'expected `kind` to be a non-empty string')

    /**
     * Token to close.
     *
     * @const {Optional<Token>} token
     */
    const token: Optional<Token> = this.tokens.at(-1)

    ok(token, 'cannot exit without token')
    ok(kind === token.kind, 'expected exit token to match current token')
    token.end = this.now()
    this.debug('exit: `%s`', token.kind)
    if (token.kind === kinds.closer) this.comment = false

    return token
  }

  /**
   * Get the current [*point*][point] in the document.
   *
   * [point]: https://github.com/syntax-tree/unist#point
   *
   * @see {@linkcode Point}
   *
   * @protected
   * @instance
   *
   * @return {Point} Current point in document
   */
  protected now(): Point {
    return this.reader.point(this.reader.index)
  }

  /**
   * Tokenize the document.
   *
   * @see {@linkcode Token}
   *
   * @protected
   * @instance
   *
   * @return {Token | undefined} Head token
   */
  protected tokenize(): Token | undefined {
    while (!this.reader.eof) {
      ok(this.reader.char, 'expected character')

      /**
       * Boolean indicating at least one character was consumed.
       *
       * @var {boolean} consumed
       */
      let consumed: boolean = false

      // tokenize match
      for (const [keep, rule, kind] of this.rules) {
        rule.lastIndex = this.reader.index

        /**
         * Character match.
         *
         * @const {CharacterMatch} match
         */
        const match: CharacterMatch = this.reader.peekMatch(rule)

        // tokenize match
        if (match && (kind === kinds.opener || this.comment)) {
          consumed = this.tokenizeMatch(kind, match[0], keep)
        }
      }

      // consume character if lexer state was not modified
      if (!consumed) {
        this.consume(this.reader.char)
        continue
      }
    }

    return this.tokens[0]
  }

  /**
   * Tokenize a character match.
   *
   * @see {@linkcode kinds}
   *
   * @protected
   * @instance
   *
   * @param {kinds} kind - Token kind
   * @param {string} chars - Character match string
   * @param {boolean} keep - If `false`, consume characters without tokenizing
   * @return {true} `true`
   */
  protected tokenizeMatch(kind: kinds, chars: string, keep: boolean): true {
    ok(typeof kind === 'string', 'expected `kind` to be a string')
    ok(kind.length > 0, 'expected `kind` to be a non-empty string')
    ok(chars, 'expected character match')

    /**
     * Current index in matched character string.
     *
     * @var {number} index
     */
    let index: number = -1

    // tokenize match
    while (++index < chars.length) {
      ok(this.reader.char === chars[index], `expected \`${chars[index]}\``)
      if (keep && !index) this.enter(kind, chars)
      this.consume(this.reader.char)
      if (keep && index === chars.length - 1) this.exit(kind)
    }

    return true
  }
}

export default Lexer
