/**
 * @file Type Tests - ParseMarkdownOptions
 * @module docast-util-from-docs/interfaces/tests/unit-d/ParseMarkdownOptions
 */

import type { Position } from '@flex-development/docast'
import type { Nilable } from '@flex-development/tutils'
import type MarkdownOptions from '../options-markdown'
import type TestSubject from '../options-markdown-parse'

describe('unit-d:interfaces/ParseMarkdownOptions', () => {
  it('should extend MarkdownOptions', () => {
    expectTypeOf<TestSubject>().toMatchTypeOf<MarkdownOptions>()
  })

  it('should match [code?: Nilable<boolean>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('code')
      .toEqualTypeOf<Nilable<boolean>>()
  })

  it('should match [multiline?: Nilable<boolean>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('multiline')
      .toEqualTypeOf<Nilable<boolean>>()
  })

  it('should match [position: Position]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('position')
      .toEqualTypeOf<Position>()
  })
})
