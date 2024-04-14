/**
 * @file Integration Tests - fromDocs
 * @module docast-util-from-docs/tests/util/integration
 */

import type { Options } from '#src/interfaces'
import type { Point } from '@flex-development/docast'
import { constant, type Assign } from '@flex-development/tutils'
import { directiveFromMarkdown } from 'mdast-util-directive'
import { directive } from 'micromark-extension-directive'
import { read } from 'to-vfile'
import { inspectNoColor } from 'unist-util-inspect'
import type { VFile } from 'vfile'
import type { TestContext } from 'vitest'
import testSubject from '../util'

describe('integration:fromDocs', () => {
  beforeEach((ctx: TestContext): void => {
    ctx.expect.addSnapshotSerializer({
      print: (val: unknown): string => inspectNoColor(val),
      test: constant(true)
    })
  })

  describe('empty document', () => {
    it('should parse empty document', () => {
      expect(testSubject('')).to.eql({ children: [], type: 'root' })
    })
  })

  describe('non-empty document', async () => {
    it.each<[VFile, Options?]>([
      [await read('__fixtures__/validate-url-string.ts'), { codeblocks: null }],
      [await read('__fixtures__/detect-syntax.ts'), { codeblocks: /@example/ }],
      [await read('__fixtures__/to-relative-specifier.ts'), {
        mdastExtensions: [directiveFromMarkdown()],
        micromarkExtensions: [directive()]
      }],
      [await read('__fixtures__/dbl-linear.ts'), { codeblocks: [/@example/] }],
      [await read('__fixtures__/reader.ts')]
    ])('document sample %#', (file, options) => {
      expect(testSubject(file, options)).toMatchSnapshot()
    })
  })

  describe('non-empty snippet', async () => {
    it.each<[VFile, Assign<Options, { end: number; from: Point }>]>([
      [await read('__fixtures__/reader.ts'), {
        end: 3461,
        from: { column: 3, line: 110, offset: 2388 }
      }]
    ])('snippet sample %#', (file, { end, from }) => {
      // Arrange
      const snippet: string = String(file).slice(from.offset, end)

      // Act + Expect
      expect(testSubject(snippet, { from })).toMatchSnapshot()
    })
  })
})
