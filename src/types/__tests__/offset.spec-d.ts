/**
 * @file Type Tests - Offset
 * @module docast-util-from-docs/types/tests/unit-d/Offset
 */

import type TestSubject from '../offset'

describe('unit-d:types/Offset', () => {
  it('should equal number', () => {
    expectTypeOf<TestSubject>().toEqualTypeOf<number>()
  })
})
