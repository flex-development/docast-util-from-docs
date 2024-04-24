/**
 * @file parseMarkdown
 * @module docast-util-from-docs/util/markdown
 */

import type { Position } from '@flex-development/docast'
import type { RootContent } from 'mdast'
import type { VFile } from 'vfile'
import { TokenKind } from './enums'
import type { ParseMarkdownOptions } from './interfaces'
import Parser from './parser'
import Token from './token'

/**
 * Turn markdown into [`mdast`][mdast] child nodes, with respect for comment
 * delimiters.
 *
 * [mdast]: https://github.com/syntax-tree/mdast
 *
 * @see {@linkcode ParseMarkdownOptions}
 * @see {@linkcode Position}
 * @see {@linkcode RootContent}
 * @see {@linkcode VFile}
 *
 * @template {RootContent} [T=RootContent] - mdast child node type
 *
 * @param {VFile | string} value - Markdown to parse
 * @param {ParseMarkdownOptions} options - Configuration options
 * @return {RootContent[]} `mdast` child node array
 */
const parseMarkdown = <T extends RootContent = RootContent>(
  value: VFile | string,
  options: ParseMarkdownOptions
): T[] => {
  const { code, position, ...rest } = options

  /**
   * Markdown token.
   *
   * @const {Token<TokenKind.markdown>} token
   */
  const token: Token<TokenKind.markdown> = new Token(TokenKind.markdown, {
    ...position,
    text: String(value)
  })

  return new Parser('', rest).applyMarkdown(token, code)
}

export default parseMarkdown
