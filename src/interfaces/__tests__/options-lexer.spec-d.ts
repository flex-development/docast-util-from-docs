/**
 * @file Type Tests - LexerOptions
 * @module docast-util-from-docs/interfaces/tests/unit-d/LexerOptions
 */

import type { Point } from '@flex-development/docast'
import type { Nilable } from '@flex-development/tutils'
import type TestSubject from '../options-lexer'

describe('unit-d:interfaces/LexerOptions', () => {
  it('should match [from?: Nilable<Point>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('from')
      .toEqualTypeOf<Nilable<Point>>()
  })

  it('should match [multiline?: Nilable<boolean>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('multiline')
      .toEqualTypeOf<Nilable<boolean>>()
  })
})
