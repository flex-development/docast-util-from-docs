/**
 * @file Token
 * @module docast-util-from-docs/token
 */

import type { Point, Position } from '@flex-development/docast'
import type { Optional } from '@flex-development/tutils'
import { ok } from 'devlop'
import type * as parsec from 'typescript-parsec'
import type { TokenKind } from './enums'

/**
 * Lexer token.
 *
 * @template {TokenKind} K - Token kind
 *
 * @class
 * @implements {parsec.Token<K>}
 */
class Token<K extends TokenKind = TokenKind> implements parsec.Token<K> {
  /**
   * Point where token ends.
   *
   * @see {@linkcode Point}
   *
   * @public
   * @instance
   * @member {Point} end
   */
  public end: Point

  /**
   * Token kind.
   *
   * @see {@linkcode TokenKind}
   *
   * @public
   * @readonly
   * @instance
   * @member {K} kind
   */
  public readonly kind: K

  /**
   * Next token.
   *
   * @public
   * @instance
   * @member {Optional<Token<K>>} next
   */
  public next: Optional<Token<K>>

  /**
   * Point where token starts.
   *
   * @public
   * @instance
   * @member {Point} start
   */
  public start: Point

  /**
   * Text value.
   *
   * @public
   * @readonly
   * @instance
   * @member {string} text
   */
  public readonly text: string

  /**
   * Create a new lexer token.
   *
   * @param {K} kind - Token kind
   * @param {Position & { text: string }} data - Token data
   */
  constructor(kind: K, data: Position & { text: string }) {
    ok(typeof kind === 'string', 'expected `kind` to be a string')
    ok(kind.length > 0, 'expected `kind` to be a non-empty string')

    this.kind = kind
    this.end = data.end
    this.start = data.start
    this.text = data.text
  }

  /**
   * Get the token position in parsec format.
   *
   * @see {@linkcode parsec.TokenPosition}
   *
   * @public
   * @instance
   *
   * @return {parsec.TokenPosition} Token position in parsec format
   */
  public get pos(): parsec.TokenPosition {
    ok(this.start, 'expected `start`')
    ok(this.end, 'expected `end`')

    return {
      columnBegin: this.start.column,
      columnEnd: this.end.column,
      index: this.start.offset,
      rowBegin: this.start.line,
      rowEnd: this.end.line
    }
  }
}

export default Token
