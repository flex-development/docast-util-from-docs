/**
 * @file Type Tests - Options
 * @module docast-util-from-docs/interfaces/tests/unit-d/Options
 */

import type { Transform } from '#src/types'
import type { Point } from '@flex-development/docast'
import type { Nilable, OneOrMany } from '@flex-development/tutils'
import type TestSubject from '../options'
import type MarkdownOptions from '../options-markdown'

describe('unit-d:interfaces/Options', () => {
  it('should extend MarkdownOptions', () => {
    expectTypeOf<TestSubject>().toMatchTypeOf<MarkdownOptions>()
  })

  it('should match [codeblocks?: Nilable<OneOrMany<RegExp | string>>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('codeblocks')
      .toEqualTypeOf<Nilable<OneOrMany<RegExp | string>>>()
  })

  it('should match [from?: Nilable<Point>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('from')
      .toEqualTypeOf<Nilable<Point>>()
  })

  it('should match [transforms?: Nilable<Transform[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('transforms')
      .toEqualTypeOf<Nilable<Transform[]>>()
  })
})
