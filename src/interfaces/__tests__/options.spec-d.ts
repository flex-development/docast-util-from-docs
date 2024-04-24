/**
 * @file Type Tests - Options
 * @module docast-util-from-docs/interfaces/tests/unit-d/Options
 */

import type { Transform } from '#src/types'
import type { Nilable, OneOrMany } from '@flex-development/tutils'
import type TestSubject from '../options'
import type LexerOptions from '../options-lexer'
import type MarkdownOptions from '../options-markdown'

describe('unit-d:interfaces/Options', () => {
  it('should extend LexerOptions', () => {
    expectTypeOf<TestSubject>().toMatchTypeOf<LexerOptions>()
  })

  it('should extend MarkdownOptions', () => {
    expectTypeOf<TestSubject>().toMatchTypeOf<MarkdownOptions>()
  })

  it('should match [codeblocks?: Nilable<OneOrMany<RegExp | string>>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('codeblocks')
      .toEqualTypeOf<Nilable<OneOrMany<RegExp | string>>>()
  })

  it('should match [transforms?: Nilable<Transform[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('transforms')
      .toEqualTypeOf<Nilable<Transform[]>>()
  })
})
