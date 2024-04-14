/**
 * @file Interfaces - Options
 * @module docast-util-from-docs/interfaces/Options
 */

import type { Transform } from '#src/types'
import type { Point } from '@flex-development/docast'
import type { Nilable, OneOrMany } from '@flex-development/tutils'
import type { Code } from 'mdast'
import type MarkdownOptions from './options-markdown'

/**
 * Configuration options.
 *
 * @see {@linkcode MarkdownOptions}
 *
 * @extends {MarkdownOptions}
 */
interface Options extends MarkdownOptions {
  /**
   * Block tag names, or regular expressions, matching block tags that should
   * have their text converted to {@linkcode Code} when parsed as markdown.
   *
   * @default '@example'
   */
  codeblocks?: Nilable<OneOrMany<RegExp | string>>

  /**
   * Parser start point.
   *
   * Node positions will be relative to this point.
   *
   * @see {@linkcode Point}
   */
  from?: Nilable<Point>

  /**
   * Tree transforms.
   *
   * @see {@linkcode Transform}
   */
  transforms?: Nilable<Transform[]>
}

export type { Options as default }
