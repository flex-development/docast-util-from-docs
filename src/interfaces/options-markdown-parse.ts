/**
 * @file Interfaces - ParseMarkdownOptions
 * @module docast-util-from-docs/interfaces/ParseMarkdownOptions
 */

import type { Position } from '@flex-development/docast'
import type { Nilable } from '@flex-development/tutils'
import type { Code } from 'mdast'
import type MarkdownOptions from './options-markdown'

/**
 * Options for parsing markdown with respect for comment delimiters.
 *
 * @see {@linkcode MarkdownOptions}
 *
 * @extends {MarkdownOptions}
 */
interface ParseMarkdownOptions extends MarkdownOptions {
  /**
   * Parse markdown value as fenced code.
   *
   * @see {@linkcode Code}
   */
  code?: Nilable<boolean>

  /**
   * Parse multiline comments.
   */
  multiline?: Nilable<boolean>

  /**
   * Position of markdown value.
   *
   * @see {@linkcode Position}
   */
  position: Position
}

export type { ParseMarkdownOptions as default }
