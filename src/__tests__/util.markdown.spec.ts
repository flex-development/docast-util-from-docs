/**
 * @file Unit Tests - parseMarkdown
 * @module docast-util-from-docs/tests/util/markdown/unit
 */

import type { Point } from '@flex-development/docast'
import { constant } from '@flex-development/tutils'
import type { RootContent } from 'mdast'
import { read } from 'to-vfile'
import { inspectNoColor } from 'unist-util-inspect'
import type { VFile } from 'vfile'
import type { TestContext } from 'vitest'
import testSubject from '../util.markdown'

describe('unit:parseMarkdown', () => {
  let end: Point
  let file: VFile
  let start: Point

  beforeAll(async () => {
    file = await read('__fixtures__/reader.ts')

    end = { column: 42, line: 128, offset: 3216 }
    start = { column: 6, line: 111, offset: 2397 }
  })

  beforeEach((ctx: TestContext): void => {
    ctx.expect.addSnapshotSerializer({
      print: (val: unknown): string => {
        /**
         * Head node.
         *
         * @const {RootContent} head
         */
        const head: RootContent = (<RootContent[]>val)[0]!

        /**
         * Tail node.
         *
         * @const {RootContent} tail
         */
        const tail: RootContent = (<RootContent[]>val).at(-1)!

        return inspectNoColor({
          children: val,
          position: { end: tail.position!.end, start: head.position!.start },
          type: 'root'
        })
      },
      test: constant(true)
    })
  })

  it('should return mdast child node array', () => {
    // Arrange
    const value: string = String(file).slice(start.offset, end.offset)

    // Act
    const result = testSubject(value, { position: { end, start } })

    // Expect
    expect(result).to.be.an('array').that.is.not.empty
    expect(result).toMatchSnapshot()
  })
})
