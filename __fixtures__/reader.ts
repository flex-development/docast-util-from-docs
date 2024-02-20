/**
 * @file Fixtures - Reader
 * @module fixtures/Reader
 */

import type { Point } from '@flex-development/docast'
import { at, clamp, fallback, isInteger } from '@flex-development/tutils'
import { ok } from 'devlop'
import type { Code } from 'micromark-util-types'
import type { VFile } from 'vfile'

/**
 * Source document reader.
 *
 * @class
 */
class Reader {
  /**
   * Source document.
   *
   * @public
   * @readonly
   * @instance
   * @member {string} document
   */
  public readonly document: string

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
   * Current position in {@linkcode document}.
   *
   * @protected
   * @instance
   * @member {number} position
   */
  protected position: number

  /**
   * Create a new source document reader.
   *
   * @see {@linkcode VFile}
   *
   * @param {VFile | string} source - Source document or file
   */
  constructor(source: VFile | string) {
    this.document = source = String(source)
    this.indices = [...source.matchAll(/^.*/gm)].map(([m]) => m.length + 1)
    this.position = 0
  }

  /**
   * Check if the reader is at the end of the document.
   *
   * @example
   *  ```ts
   *  while (!reader.eof) {
   *    // do something
   *  }
   *  ```
   *
   * @public
   * @instance
   *
   * @return {boolean} `true` if at end of document
   */
  public get eof(): boolean {
    return this.index >= this.document.length
  }

  /**
   * Get the current position in the document.
   *
   * @public
   * @instance
   *
   * @return {number} Current position in document
   */
  public get index(): number {
    return this.position
  }

  /**
   * Get the next `k`-th character code from the document without changing the
   * position of the reader, with `null` denoting the end of the document.
   *
   * @see {@linkcode Code}
   *
   * @public
   * @instance
   *
   * @param {number} [k=1] - Difference between index of next `k`-th character
   * code and current position in document
   * @return {Code} Peeked character code or `null`
   */
  public peek(k: number = 1): Code {
    ok(isInteger(k), 'expected k to be an integer')
    return fallback(this.document.codePointAt(this.index + k), null)
  }

  /**
   * Get a [*point*][1] in the document by `offset`.
   *
   * The given `offset` must be an integer in the range `[0, document.length]`.\
   * If invalid, `point.column` and `point.line` will have a value of `-1`.
   *
   * > **Point** represents one place in a source [*file*][2].
   * >
   * > The `line` field (`1`-indexed integer) represents a line in a source
   * > file. The `column` field (`1`-indexed integer) represents a column in a
   * > source file. The `offset` field (`0`-indexed integer) represents a
   * > character in a source file.
   * >
   * > The term character means a (UTF-16) code unit which is defined in the
   * > [Web IDL][3] specification.
   *
   * [1]: https://github.com/syntax-tree/unist#point
   * [2]: https://github.com/syntax-tree/unist#file
   * [3]: https://webidl.spec.whatwg.org/
   *
   * @see {@linkcode Point}
   * @see https://github.com/syntax-tree/unist#point
   *
   * @public
   * @instance
   *
   * @param {number?} [offset=this.index] - Index of character in document
   * @return {Point} Point in document
   */
  public point(offset: number = this.index): Point {
    /**
     * Current offset (`0`-indexed integer).
     *
     * @var {number} index
     */
    let index: number = 0

    /**
     * Current line (`1`-indexed integer).
     *
     * @var {number} line
     */
    let line: number = -1

    /**
     * Current {@linkcode Point} in source document.
     *
     * @const {Point} point
     */
    const point: Point = { column: -1, line, offset }

    // convert offset to point
    if (isInteger(offset) && offset > -1 && offset <= this.document.length) {
      while (++line < this.indices.length) {
        for (let j = 0; j < at(this.indices, line)!; j++) {
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

  /**
   * Get the next `k`-th character code from the document, with `null` denoting
   * the end of the document.
   *
   * Unlike {@linkcode peek}, this method changes the position of the reader.
   *
   * @see {@linkcode Code}
   *
   * @public
   * @instance
   *
   * @param {number} [k=1] - Difference between index of next `k`-th character
   * code and current position in document
   * @return {Code} Next `k`-th character or `null`
   */
  public read(k: number = 1): Code {
    ok(isInteger(k), 'expected k to be an integer')
    ok(!this.eof, 'cannot read past end of document')
    this.position = clamp(this.position + k, 0, this.document.length)
    return fallback(this.document.codePointAt(this.position), null)
  }
}

export default Reader
