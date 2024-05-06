/**
 * @file Type Tests - LexerOptions
 * @module docast-util-from-docs/interfaces/tests/unit-d/LexerOptions
 */

import type { Nilable } from '@flex-development/tutils'
import type { Point } from '@flex-development/vfile-location'
import type TestSubject from '../options-lexer'

describe('unit-d:interfaces/LexerOptions', () => {
  it('should match [from?: Point | null | undefined]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('from')
      .toEqualTypeOf<Nilable<Point>>()
  })

  it('should match [multiline?: boolean | null | undefined]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('multiline')
      .toEqualTypeOf<Nilable<boolean>>()
  })
})
