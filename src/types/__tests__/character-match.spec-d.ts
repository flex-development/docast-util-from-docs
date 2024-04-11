/**
 * @file Type Tests - CharacterMatch
 * @module docast-util-from-docs/types/tests/unit-d/CharacterMatch
 */

import type { Nullable } from '@flex-development/tutils'
import type TestSubject from '../character-match'

describe('unit-d:types/CharacterMatch', () => {
  it('should equal Nullable<RegExpExecArray>', () => {
    expectTypeOf<TestSubject>().toEqualTypeOf<Nullable<RegExpExecArray>>()
  })
})
