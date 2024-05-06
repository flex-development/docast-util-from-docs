/**
 * @file Interfaces - LexerOptions
 * @module docast-util-from-docs/interfaces/LexerOptions
 */

import type { Point } from '@flex-development/vfile-location'

/**
 * Lexer configuration options.
 */
interface LexerOptions {
  /**
   * Point before first character in source file.
   *
   * Node positions will be relative to this point.
   *
   * @see {@linkcode Point}
   */
  from?: Point | null | undefined

  /**
   * Allow multiline comments.
   */
  multiline?: boolean | null | undefined
}

export type { LexerOptions as default }
