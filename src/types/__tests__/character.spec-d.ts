/**
 * @file Type Tests - Character
 * @module docast-util-from-docs/types/tests/unit-d/Character
 */

import type { Nullable } from '@flex-development/tutils'
import type TestSubject from '../character'

describe('unit-d:types/Character', () => {
  it('should equal Nullable<string>', () => {
    expectTypeOf<TestSubject>().toEqualTypeOf<Nullable<string>>()
  })
})
