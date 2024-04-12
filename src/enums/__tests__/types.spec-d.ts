/**
 * @file Unit Tests - types
 * @module docast-util-from-docs/enums/tests/unit-d/types
 */

import type { Root } from '@flex-development/docast'
import type {
  InclusiveDescendant,
  Type
} from '@flex-development/unist-util-types'
import type TestSubject from '../types'

describe('unit-d:enums/types', () => {
  type T = Type<InclusiveDescendant<Root>>

  it('should contain all registered node types', () => {
    expectTypeOf<keyof typeof TestSubject>().toEqualTypeOf<T>()
    expectTypeOf<(typeof TestSubject)[T]>().toEqualTypeOf<TestSubject>()
  })
})
