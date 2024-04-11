/**
 * @file Location
 * @module docast-util-from-docs/Location
 */

import type { Point } from '@flex-development/docast'
import type * as unist from 'unist'
import type { VFile } from 'vfile'
import type { Offset } from './types'

/**
 * Location utility.
 *
 * Facilitates conversions between positional (line and column-based) and offset
 * (range-based) locations.
 *
 * @class
 */
class Location {
  /**
   * Source document.
   *
   * @protected
   * @readonly
   * @instance
   * @member {string} document
   */
  protected readonly document: string

  /**
   * List, where each index is a line number (`0`-based), and each value is the
   * number of columns in the line.
   *
   * @protected
   * @readonly
   * @instance
   * @member {number[]} indices
   */
  protected readonly indices: number[]

  /**
   * Create a new location utility.
   *
   * @see {@linkcode VFile}
   *
   * @param {VFile | string} source - Source document or file to index
   */
  constructor(source: VFile | string) {
    this.document = source = String(source)
    this.indices = [...source.matchAll(/^.*/gm)].map(([m]) => m.length + 1)
  }

  /**
   * Get an offset for `point`.
   *
   * @see {@linkcode Offset}
   * @see {@linkcode Point}
   *
   * @public
   * @instance
   *
   * @param {unist.Point} point - Place in source document
   * @return {Offset} Character index or `-1` if `point` is invalid
   */
  public offset(point: unist.Point): Offset {
    /**
     * Offset found?
     *
     * @var {boolean} found
     */
    let found: boolean = false

    /**
     * Current offset.
     *
     * @var {Offset} offset
     */
    let offset: Offset = -1

    // get offset
    if (
      point.column &&
      point.line &&
      point.line <= this.indices.length &&
      typeof this.indices[point.line - 1] === 'number'
    ) {
      for (let line = 0; line < point.line; line++) {
        for (let j = 0; j < this.indices[line]!; j++) {
          // increase current offset
          offset++

          // stop search
          if (point.column === j + 1 && point.line === line + 1) {
            found = true
            break
          }
        }
      }

      // reset offset if not found
      if (!found) offset = -1
    }

    return offset
  }

  /**
   * Get a [*point*][point] in the document.
   *
   * **Note**: `point.column` and `point.line` will have a value of `-1` when
   * `offset` is invalid or out of bounds.
   *
   * [point]: https://github.com/syntax-tree/unist#point
   *
   * @see {@linkcode Offset}
   * @see {@linkcode Point}
   *
   * @public
   * @instance
   *
   * @param {Offset} offset - Index of character in source document
   * @return {Point} Point in document
   */
  public point(offset: Offset): Point {
    /**
     * Current offset.
     *
     * @var {Offset} index
     */
    let index: Offset = 0

    /**
     * Current line in a source file (1-indexed integer).
     *
     * @var {number} line
     */
    let line: number = -1

    /**
     * Current point in document.
     *
     * @const {Point} point
     */
    const point: Point = { column: -1, line, offset }

    // convert offset to point
    if (offset > -1 && offset <= this.document.length) {
      while (++line < this.indices.length) {
        for (let j = 0; j < this.indices[line]!; j++) {
          if (index++ === offset) {
            point.column = j + 1
            point.line = line + 1
            break
          }
        }
      }
    }

    return point
  }
}

export default Location
