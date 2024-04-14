/**
 * @file Interfaces - MarkdownOptions
 * @module docast-util-from-docs/interfaces/MarkdownOptions
 */

import type { Nilable } from '@flex-development/tutils'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'
import type { Extension as MicromarkExtension } from 'micromark-util-types'

/**
 * Common markdown parsing options.
 */
interface MarkdownOptions {
  /**
   * Markdown extensions to change how micromark tokens are converted to nodes.
   *
   * @see {@linkcode MdastExtension}
   * @see https://github.com/syntax-tree/mdast-util-from-markdown#list-of-extensions
   */
  mdastExtensions?: Nilable<MdastExtension[]>

  /**
   * Micromark extensions to change how markdown is parsed.
   *
   * @see {@linkcode MicromarkExtension}
   * @see https://github.com/micromark/micromark#extensions
   */
  micromarkExtensions?: Nilable<MicromarkExtension[]>
}

export type { MarkdownOptions as default }
