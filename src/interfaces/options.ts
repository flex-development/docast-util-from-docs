/**
 * @file Interfaces - Options
 * @module docast-util-from-docs/interfaces/Options
 */

import type { Transform } from '#src/types'
import type { Nilable, OneOrMany } from '@flex-development/tutils'
import type { Code } from 'mdast'
import type * as mdast from 'mdast-util-from-markdown'
import type * as micromark from 'micromark-util-types'

/**
 * Parser options.
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
   * Extensions to change how mdast tokens are converted to syntax tree nodes.
   *
   * @see {@linkcode mdast.Extension}
   * @see https://github.com/syntax-tree/mdast-util-from-markdown
   */
  mdastExtensions?: Nilable<mdast.Extension[]>

  /**
   * Markdown syntax extensions.
   *
   * @see {@linkcode micromark.Extension}
   * @see https://github.com/micromark/micromark#extensions
   */
  micromarkExtensions?: Nilable<micromark.Extension[]>

  /**
   * Tree transforms.
   *
   * @see {@linkcode Transform}
   */
  transforms?: Nilable<Transform[]>
}

export type { Options as default }
