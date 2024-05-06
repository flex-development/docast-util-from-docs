/**
 * @file fromDocs
 * @module docast-util-from-docs/util
 */

import type { Root } from '@flex-development/docast'
import type { VFile, Value } from 'vfile'
import type { Options } from './interfaces'
import Parser from './parser'

/**
 * Turn docblocks into a syntax tree.
 *
 * @see {@linkcode Options}
 * @see {@linkcode Root}
 * @see {@linkcode VFile}
 * @see {@linkcode Value}
 * @see https://github.com/flex-development/docast
 *
 * @param {Value | VFile} value - Source file or document
 * @param {(Options | null)?} [options] - Parser options
 * @return {Root} docast tree
 */
const fromDocs = (value: Value | VFile, options?: Options | null): Root => {
  return new Parser(value, options).parse()
}

export default fromDocs
