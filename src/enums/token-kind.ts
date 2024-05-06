/**
 * @file Enums - TokenKind
 * @module docast-util-from-docs/enums/TokenKind
 */

/**
 * Lexer token types.
 *
 * @enum {string}
 */
enum TokenKind {
  closer = 'closer',
  delimiter = 'delimiter',
  eof = 'eof',
  markdown = 'markdown',
  opener = 'opener',
  tag = 'tag',
  typeExpression = 'typeExpression',
  whitespace = 'whitespace'
}

export default TokenKind
