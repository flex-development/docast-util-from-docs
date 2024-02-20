/**
 * @file fromDocs
 * @module docast-util-from-docs/util
 */

import type { Root } from '@flex-development/docast'
import type { Nilable } from '@flex-development/tutils'
import type { VFile } from 'vfile'
import type { Options } from './interfaces'
import Parser from './parser'

/**
 * Turn docblocks into a syntax tree.
 *
 * @see {@linkcode Options}
 * @see {@linkcode Root}
 * @see {@linkcode VFile}
 * @see https://github.com/flex-development/docast
 *
 * @param {VFile | string} value - Source file or document
 * @param {Nilable<Options>?} [options] - Parser options
 * @return {Root} docast tree
 */
const fromDocs = (value: VFile | string, options?: Nilable<Options>): Root => {
  return new Parser(String(value), options).parse()
}

export default fromDocs
