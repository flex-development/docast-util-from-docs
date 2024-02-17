/**
 * @file Interfaces - Token
 * @module docast-util-from-docs/interfaces/Token
 */

import type { TokenKind } from '#src/enums'
import type { DocastNode, Point } from '@flex-development/docast'

/**
 * Lexer token.
 */
interface Token {
  /**
   * Point where token ends.
   *
   * @see {@linkcode Point}
   */
  end: Point

  /**
   * Token kind.
   *
   * @see {@linkcode DocastNode}
   * @see {@linkcode TokenKind}
   */
  kind: DocastNode['type'] | TokenKind

  /**
   * Point where token starts.
   *
   * @see {@linkcode Point}
   */
  start: Point
}

export type { Token as default }
