/**
 * @file Unit Tests - parseMarkdown
 * @module docast-util-from-docs/tests/util/markdown/unit
 */

import type { ParseMarkdownOptions } from '#src/interfaces'
import { constant } from '@flex-development/tutils'
import { inspectNoColor } from '@flex-development/unist-util-inspect'
import type { RootContent } from 'mdast'
import { read } from 'to-vfile'
import type { VFile } from 'vfile'
import type { TestContext } from 'vitest'
import testSubject from '../util.markdown'

describe('unit:parseMarkdown', async () => {
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

  it.each<[VFile, ParseMarkdownOptions]>([
    [await read('__fixtures__/dbl-linear.ts'), {
      position: {
        end: { column: 55, line: 63, offset: 1611 },
        start: { column: 8, line: 63, offset: 1564 }
      }
    }],
    [await read('__fixtures__/reader.ts'), {
      position: {
        end: { column: 42, line: 128, offset: 3216 },
        start: { column: 6, line: 111, offset: 2397 }
      }
    }]
  ])('sample %#', (file, options) => {
    // Arrange
    const value: string = String(file).slice(
      options.position.start.offset,
      options.position.end.offset
    )

    // Act
    const result = testSubject(value, options)

    // Expect
    expect(result).to.be.an('array').that.is.not.empty
    expect(result).toMatchSnapshot()
  })
})
