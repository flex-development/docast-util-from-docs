/**
 * @file Type Tests - UncommentReplacer
 * @module docast-util-from-docs/types/tests/unit-d/UncommentReplacer
 */

import type TestSubject from '../uncomment-replacer'

describe('unit-d:types/UncommentReplacer', () => {
  it('should be callable with [string, number, string]', () => {
    // Arrange
    type Parameters = [string, number, string]

    // Expect
    expectTypeOf<TestSubject>().parameters.toEqualTypeOf<Parameters>()
  })

  it('should return string', () => {
    expectTypeOf<TestSubject>().returns.toBeString()
  })
})
