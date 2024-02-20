/**
 * @file Type Tests - Transform
 * @module docast-util-from-docs/types/tests/unit-d/Transform
 */

import type { Root } from '@flex-development/docast'
import type TestSubject from '../transform'

describe('unit-d:types/Transform', () => {
  it('should be callable with [Root]', () => {
    expectTypeOf<TestSubject>().parameters.toEqualTypeOf<[Root]>()
  })

  it('should return void', () => {
    expectTypeOf<TestSubject>().returns.toBeVoid()
  })
})
