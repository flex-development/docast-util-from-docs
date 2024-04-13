/**
 * @file Location
 * @module docast-util-from-docs/Location
 */

import type { Point } from '@flex-development/docast'
import type { Nilable } from '@flex-development/tutils'
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
   * Point before first character in {@linkcode document}.
   *
   * @see {@linkcode Point}
   *
   * @public
   * @readonly
   * @instance
   * @member {Readonly<Point>} from
   */
  public readonly from: Readonly<Point>

  /**
   * Create a new location utility.
   *
   * @see {@linkcode Point}
   * @see {@linkcode VFile}
   *
   * @param {VFile | string} source - Source document or file to index
   * @param {Nilable<Point>?} [from] - Point before first character in `source`
   */
  constructor(source: VFile | string, from?: Nilable<Point>) {
    this.document = String(source)
    this.from = Object.assign({}, from ?? { column: 1, line: 1, offset: 0 })
    this.from = Object.freeze(this.from)
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
    return this.#pt(
      pt => pt.line === point.line && pt.column === point.column,
      pt => pt.offset,
      -1
    )
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
    return this.#pt(
      pt => pt.offset === offset,
      pt => pt,
      { column: -1, line: -1, offset }
    )
  }

  /**
   * Iterate over characters in {@linkcode document} by point.
   *
   * @private
   * @instance
   *
   * @template {Offset | Point} T - Return type when `check` succeeds
   * @template {Offset | Point} T - Return type when `check` fails
   *
   * @param {(pt: Point) => boolean} check - Point test
   * @param {(pt: Point) => T} success - Function that returns a point or offset
   * on successful `check`
   * @param {T} failure - Point or offset on failed `check`
   * @return {T} Iterator result
   */
  #pt<T extends Offset | Point>(
    check: (pt: Point) => boolean,
    success: (pt: Point) => T,
    failure: T
  ): T {
    /**
     * Current point.
     *
     * @const {Point} pt
     */
    const pt: Point = { ...this.from }

    // advance point
    for (const char of this.document + '\n') {
      if (check(pt)) {
        return success(pt)
      } else if (/[\n\r]/.test(char)) {
        pt.column = 1
        pt.line++
        pt.offset++
      } else {
        pt.column++
        pt.offset++
      }
    }

    return failure
  }
}

export default Location
