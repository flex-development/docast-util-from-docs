/**
 * @file Enums - TokenKind
 * @module docast-util-from-docs/enums/TokenKind
 */

import type { DocastNode } from '@flex-development/docast'

/**
 * Lexer token types.
 *
 * @enum {DocastNode['type']}
 */
enum TokenKind {
  BLOCK_TAG = 'blockTag',
  BLOCK_TAG_ID = 'blockTagId',
  BLOCK_TAG_TEXT = 'blockTagText',
  COMMENT = 'comment',
  DESCRIPTION = 'description',
  INLINE_TAG = 'inlineTag',
  INLINE_TAG_ID = 'inlineTagId',
  INLINE_TAG_VALUE = 'inlineTagValue',
  TYPE_EXPRESSION = 'typeExpression'
}

export default TokenKind
