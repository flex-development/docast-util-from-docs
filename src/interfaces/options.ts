/**
 * @file Interfaces - Options
 * @module docast-util-from-docs/interfaces/Options
 */

import type { Transform } from '#src/types'
import type { Nilable, OneOrMany } from '@flex-development/tutils'
import type { Code } from 'mdast'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'
import type { Extension as MicromarkExtension } from 'micromark-util-types'

/**
 * Configuration options.
 */
interface Options {
  /**
   * Block tag node names and tags, or regular expressions, matching block tags
   * that should have their text converted to {@linkcode Code} when parsed as
   * markdown.
   *
   * @default 'example'
   */
  codeblocks?: Nilable<OneOrMany<RegExp | string>>

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

  /**
   * Tree transforms.
   *
   * @see {@linkcode Transform}
   */
  transforms?: Nilable<Transform[]>
}

export type { Options as default }
