/**
 * @file Reader
 * @module docast-util-from-docs/Reader
 */

import type { Point } from '@flex-development/docast'
import type { Nilable } from '@flex-development/tutils'
import { ok } from 'devlop'
import type { VFile } from 'vfile'
import Location from './location'
import type { Character, CharacterMatch, Offset } from './types'

/**
 * Character reader.
 *
 * @see {@linkcode Location}
 *
 * @class
 * @extends {Location}
 */
class Reader extends Location {
  /**
   * Current position in {@linkcode document}.
   *
   * @protected
   * @instance
   * @member {number} position
   */
  protected position: number

  /**
   * Create a new character reader.
   *
   * @see {@linkcode Point}
   * @see {@linkcode VFile}
   *
   * @param {VFile | string} source - Source document or file
   * @param {Nilable<Point>?} [from] - Start point
   */
  constructor(source: VFile | string, from?: Nilable<Point>) {
    super(String(source), from)
    this.position = 0
  }

  /**
   * Get the current character without changing the position of the reader, with
   * `null` denoting the end of the document.
   *
   * @see {@linkcode Character}
   *
   * @public
   * @instance
   *
   * @return {Character} Current character or `null`
   */
  public get char(): Character {
    return this.peek(0)
  }

  /**
   * Check if the reader is at the end of the document.
   *
   * @public
   * @instance
   *
   * @return {boolean} `true` if at end of document, `false` otherwise
   */
  public get eof(): boolean {
    return this.index >= this.document.length
  }

  /**
   * Get the current position in the document.
   *
   * @see {@linkcode Offset}
   *
   * @public
   * @instance
   *
   * @return {Offset} Current position in document
   */
  public get index(): Offset {
    return this.position
  }

  /**
   * Get the next `k`-th character from the document without changing the
   * position of the reader, with `null` denoting the end of the document.
   *
   * @see {@linkcode Character}
   *
   * @public
   * @instance
   *
   * @param {number?} [k=1] - Difference between index of next `k`-th character
   * and current position in document
   * @return {Character} Peeked character or `null`
   */
  public peek(k: number = 1): Character {
    ok(typeof k === 'number', 'expected `k` to be a number')
    ok(!Number.isNaN(k), 'expected `k` not to be `NaN`')
    return this.document[this.index + k] ?? null
  }

  /**
   * Get the next match from the document without changing the position of the
   * reader, with `null` denoting no match.
   *
   * @see {@linkcode CharacterMatch}
   *
   * @public
   * @instance
   *
   * @param {RegExp} test - Character test
   * @return {CharacterMatch} Peeked character match or `null`
   */
  public peekMatch(test: RegExp): CharacterMatch {
    test.lastIndex = this.index
    return test.exec(this.document.slice(this.index))
  }

  /**
   * Get the next `k`-th character from the document, with `null` denoting the
   * end of the document.
   *
   * Unlike {@linkcode peek}, this method changes the position of the reader.
   *
   * @see {@linkcode Character}
   *
   * @public
   * @instance
   *
   * @param {number?} [k=1] - Difference between index of next `k`-th character
   * and current position in document
   * @return {Character} Next `k`-th character or `null`
   */
  public read(k: number = 1): Character {
    ok(typeof k === 'number', 'expected `k` to be a number')
    ok(!Number.isNaN(k), 'expected `k` not to be `NaN`')
    return this.document[this.position += k] ?? null
  }
}

export default Reader
