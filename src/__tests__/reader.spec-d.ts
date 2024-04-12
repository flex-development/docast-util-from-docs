/**
 * @file Type Tests - Reader
 * @module docast-util-from-docs/tests/unit-d/Reader
 */

import type Location from '../location'
import type TestSubject from '../reader'

describe('unit-d:Reader', () => {
  it('should extend Location', () => {
    expectTypeOf<TestSubject>().toMatchTypeOf<Location>()
  })
})
