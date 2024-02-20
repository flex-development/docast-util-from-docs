/**
 * @file Lexer
 * @module docast-util-from-docs/lexer
 */

import type { Point } from '@flex-development/docast'
import {
  at,
  clamp,
  isInteger,
  isNumber,
  isString,
  reverse,
  type Nullable,
  type Optional
} from '@flex-development/tutils'
import { ok } from 'devlop'
import type * as unist from 'unist'
import type { VFile } from 'vfile'
import { TokenKind } from './enums'
import type { Token } from './interfaces'

/**
 * Document tokenizer.
 *
 * @class
 */
class Lexer {
  /**
   * Source document.
   *
   * @public
   * @readonly
   * @instance
   * @member {string} document
   */
  public readonly document: string

  /**
   * Index of current character in {@linkcode document}.
   *
   * @protected
   * @instance
   * @member {number} offset
   */
  protected index: number

  /**
   * List, where each index is a line number (`0`-based), and each value is the
   * number of columns in the line.
   *
   * @protected
   * @readonly
   * @instance
   * @member {number[]} indices
   */
  protected readonly indices: number[]

  /**
   * Regular expressions used to search for [comments][1] and [descendents][2].
   *
   * [1]: https://regex101.com/r/VRKolK
   * [2]: https://regex101.com/r/F1g4RP
   *
   * @protected
   * @readonly
   * @instance
   * @member {Record<'descendent' | 'parent', RegExp>} search
   */
  protected readonly search: Record<'descendent' | 'parent', RegExp>

  /**
   * Token sequence.
   *
   * @see {@linkcode Token}
   *
   * @public
   * @readonly
   * @instance
   * @member {Token[]} tokens
   */
  public readonly tokens: Token[]

  /**
   * Create a new document tokenizer.
   *
   * @param {VFile | string} source - Source document or file
   */
  constructor(source: VFile | string) {
    this.document = source = String(source)
    this.indices = [...source.matchAll(/^.*/gm)].map(([m]) => m.length + 1)
    this.index = 0
    this.tokens = []

    this.search = {
      descendent:
        /(?=(?<description>(?<=\/\*{2}(?:[\t ]+|(?:[\n\r]+[\t ]*\*[\t ]+)))(?!(?<!{)@\b\S+)[\S\s]*?(?=(?:[\t\n\r ]*\*\/)|(?:[\t\n\r *]*\*[\t ]*(?<!{)@\b\S+)))|(?<blockTag>(?<=^ +\* |(?:\/\*\* +))(?<blockTagId>@\b.+?(?=[\s}]|$))(?:\s*(?<typeExpression>{[^@].*?}?}))?(?:(?:[\n\r][\t ]*\*(?:[\n\r]|[\t ]*)(?![\t\n\r ]*\*[\t ]*(?<!{)@\b\S+|\/))|[\t ]*)(?<blockTagText>(?![\t ]*@\w+).*?)(?=(?:(?:\s*\*\n)*\s*\*\/)|(?:(?:\s*\*\n)?\s+\*[\t ]+@\w+))))|(?<inlineTag>{(?<inlineTagId>@\b.+?(?=[\s}]))[\s*]*(?<inlineTagValue>.*?)})/gms,
      parent: /(?<opener>\/\*{2}).*?(?<closer>\*\/)/gmsy
    }
  }

  /**
   * Check if the lexer is at the end of the document.
   *
   * @public
   *
   * @return {boolean} `true` if at end of document, `false` otherwise
   */
  public get eof(): boolean {
    return this.index >= this.document.length
  }

  /**
   * Open a new token.
   *
   * @protected
   *
   * @param {TokenKind} kind - Token kind
   * @return {Token} Open token
   */
  protected enter(kind: TokenKind): Token {
    /**
     * Lexer token.
     *
     * @const {Token} token
     */
    const token: Token = {
      end: this.point(-1),
      kind,
      start: this.point()
    }

    this.tokens.push(token)
    return token
  }

  /**
   * Close an open token.
   *
   * @protected
   *
   * @param {TokenKind} kind - Token kind
   * @return {Token} Closed token
   */
  protected exit(kind: TokenKind): Token {
    /**
     * Open lexer token.
     *
     * @const {Optional<Token>} token
     */
    const token: Optional<Token> = reverse([...this.tokens]).find(token => {
      return token.kind === kind
    })

    ok(token, 'cannot exit without open token')
    ok(token.end.offset === -1, 'expected open token')
    token.end = this.point()

    return token
  }

  /**
   * Get an offset for `point`.
   *
   * @see {@linkcode unist.Point}
   *
   * @public
   *
   * @param {unist.Point?} [point=this.point()] - Place in source document
   * @return {number} Character offset or `-1` if `point` is invalid
   */
  public offset(point: unist.Point = this.point()): number {
    /**
     * Offset found?
     *
     * @var {boolean} found
     */
    let found: boolean = false

    /**
     * Current offset.
     *
     * @var {number} offset
     */
    let offset: number = -1

    // get offset
    if (
      point.column &&
      point.line &&
      point.line <= this.indices.length &&
      isNumber(at(this.indices, point.line - 1))
    ) {
      for (let line = 0; line < point.line; line++) {
        for (let j = 0; j < at(this.indices, line)!; j++) {
          // increase current offset
          offset++

          // stop search
          if (point.column === j + 1 && point.line === line + 1) {
            found = true
            break
          }
        }
      }

      // reset offset if not found
      if (!found) offset = -1
    }

    return offset
  }

  /**
   * Get a [*point*][1] in the document.
   *
   * **Note**: `point.column` and `point.line` will have a value of `-1` when
   * `offset` is invalid or out of bounds.
   *
   * [1]: https://github.com/syntax-tree/unist#point
   *
   * @see {@linkcode Point}
   *
   * @public
   *
   * @param {number?} [offset=this.index] - Index of character in document
   * @return {Point} Point in document
   */
  public point(offset: number = this.index): Point {
    /**
     * Current offset.
     *
     * @var {number} index
     */
    let index: number = 0

    /**
     * Current line in a source file (1-indexed integer).
     *
     * @var {number} line
     */
    let line: number = -1

    /**
     * Current point in document.
     *
     * @const {Point} point
     */
    const point: Point = { column: -1, line, offset }

    // convert offset to point
    if (isInteger(offset) && offset > -1 && offset <= this.document.length) {
      while (++line < this.indices.length) {
        for (let j = 0; j < at(this.indices, line)!; j++) {
          if (index++ === offset) {
            point.column = j + 1
            point.line = line + 1
            break
          }
        }
      }
    }

    return point
  }

  /**
   * Change the position of the lexer.
   *
   * @protected
   *
   * @param {number} [k=1] - Difference between index of next `k`-th character
   * and current position in document
   * @return {void} Nothing
   */
  protected read(k: number = 1): void {
    ok(isInteger(k), 'expected k to be an integer')
    ok(!this.eof, 'cannot read past end of document')
    this.index = clamp(this.index + k, 0, this.document.length)
    return void k
  }

  /**
   * Tokenize the document.
   *
   * @public
   *
   * @return {void} Nothing
   */
  public tokenize(): void {
    while (!this.eof) {
      this.search.parent.lastIndex = this.index

      /**
       * Possible comment match.
       *
       * @const {Nullable<RegExpMatchArray>} match
       */
      const match: Nullable<RegExpMatchArray> = this
        .search
        .parent
        .exec(this.document)

      /**
       * Difference between index of next character and current position in
       * document.
       *
       * @var {number} k
       */
      let k: number = 1

      // tokenize comment and comment descendents
      if (match) {
        const [comment] = match

        /**
         * Tokenize a comment descendent.
         *
         * @param {TokenKind} kind - Token kind
         * @param {string} value - Comment descendent value
         * @param {number} index - Comment descendent match index
         * @return {number} Difference between index of next character and
         * current position in document
         */
        const tokenizeDescendent = (
          kind: TokenKind,
          value: string,
          index: number
        ): number => {
          /**
           * Difference between index of first character in descendent value and
           * current position in document.
           *
           * @const {number} j
           */
          const j: number = comment.indexOf(value, index) - (comment.length - k)

          // enter token
          this.read(j)
          this.enter(kind)

          // exit token
          this.read(value.length)
          this.exit(kind)

          return k - (j + value.length)
        }

        // set difference between index of next character and current position
        // in document to length of matched comment. this value will decrease as
        // comment descendents are tokenized
        k = comment.length

        // enter comment token
        this.enter(TokenKind.COMMENT)

        // tokenize comment descendents
        for (const match of comment.matchAll(this.search.descendent)) {
          ok(match.groups, 'expected match.groups to be an object')
          ok(isNumber(match.index), 'expected match.index to be a number')
          const {
            description,
            blockTag,
            blockTagId,
            blockTagText,
            typeExpression,
            inlineTag,
            inlineTagId,
            inlineTagValue
          } = match.groups

          // tokenize block tag
          if (isString(blockTag)) {
            k = tokenizeDescendent(TokenKind.BLOCK_TAG, blockTag, match.index)

            // tokenize block tag identifier
            if (isString(blockTagId)) {
              k = tokenizeDescendent(
                TokenKind.BLOCK_TAG_ID,
                blockTagId,
                match.index
              )
            }

            // tokenize type expression
            if (isString(typeExpression)) {
              k = tokenizeDescendent(
                TokenKind.TYPE_EXPRESSION,
                typeExpression,
                match.index
              )
            }

            // tokenize block tag text
            if (isString(blockTagText)) {
              k = tokenizeDescendent(
                TokenKind.BLOCK_TAG_TEXT,
                blockTagText,
                match.index
              )
            }
          }

          // tokenize implicit description
          if (isString(description)) {
            k = tokenizeDescendent(
              TokenKind.DESCRIPTION,
              description,
              match.index
            )
          }

          // tokenize inline tag
          if (isString(inlineTag)) {
            k = tokenizeDescendent(TokenKind.INLINE_TAG, inlineTag, match.index)

            // tokenize inline tag identifier
            if (isString(inlineTagId)) {
              k = tokenizeDescendent(
                TokenKind.INLINE_TAG_ID,
                inlineTagId,
                match.index
              )
            }

            // tokenize inline tag value
            if (isString(inlineTagValue)) {
              k = tokenizeDescendent(
                TokenKind.INLINE_TAG_VALUE,
                inlineTagValue,
                match.index
              )
            }
          }
        }

        // exit comment token
        this.read(k)
        this.exit(TokenKind.COMMENT)
        continue
      }

      // consume character codes
      this.read(k)
    }

    return void this
  }
}

export default Lexer
