/**
 * @file Interfaces - LexerOptions
 * @module docast-util-from-docs/interfaces/LexerOptions
 */

import type { Point } from '@flex-development/docast'
import type { Nilable } from '@flex-development/tutils'

/**
 * Lexer configuration options.
 */
interface LexerOptions {
  /**
   * Start point.
   *
   * Node positions will be relative to this point.
   *
   * @see {@linkcode Point}
   */
  from?: Nilable<Point>

  /**
   * Allow multiline comments.
   */
  multiline?: Nilable<boolean>
}

export type { LexerOptions as default }
