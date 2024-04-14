/**
 * @file Type Tests - MarkdownOptions
 * @module docast-util-from-docs/interfaces/tests/unit-d/MarkdownOptions
 */

import type { Nilable } from '@flex-development/tutils'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type TestSubject from '../options-markdown'

describe('unit-d:interfaces/MarkdownOptions', () => {
  it('should match [mdastExtensions?: Nilable<MdastExtension[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('mdastExtensions')
      .toEqualTypeOf<Nilable<MdastExtension[]>>()
  })

  it('should match [micromarkExtensions?: Nilable<MicromarkExtension[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('micromarkExtensions')
      .toEqualTypeOf<Nilable<MicromarkExtension[]>>()
  })
})
