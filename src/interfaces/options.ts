/**
 * @file Interfaces - Options
 * @module docast-util-from-docs/interfaces/Options
 */

import type { Transform } from '#src/types'
import type { Nilable, OneOrMany } from '@flex-development/tutils'
import type { Code } from 'mdast'
import type LexerOptions from './options-lexer'
import type MarkdownOptions from './options-markdown'

/**
 * Configuration options.
 *
 * @see {@linkcode LexerOptions}
 * @see {@linkcode MarkdownOptions}
 *
 * @extends {LexerOptions}
 * @extends {MarkdownOptions}
 */
interface Options extends LexerOptions, MarkdownOptions {
  /**
   * Block tag names, or regular expressions, matching block tags that should
   * have their text converted to {@linkcode Code} when parsed as markdown.
   *
   * @default '@example'
   */
  codeblocks?: Nilable<OneOrMany<RegExp | string>>

  /**
   * Tree transforms.
   *
   * @see {@linkcode Transform}
   */
  transforms?: Nilable<Transform[]>
}

export type { Options as default }
