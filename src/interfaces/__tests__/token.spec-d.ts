/**
 * @file Type Tests - Token
 * @module docast-util-from-docs/interfaces/tests/unit-d/Token
 */

import type { TokenKind } from '#src/enums'
import type { DocastNode, Point } from '@flex-development/docast'
import type TestSubject from '../token'

describe('unit-d:interfaces/Token', () => {
  it('should match [end: Point]', () => {
    expectTypeOf<TestSubject>().toHaveProperty('end').toEqualTypeOf<Point>()
  })

  it('should match [kind: DocastNode["type"] | TokenKind]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('kind')
      .toEqualTypeOf<DocastNode['type'] | TokenKind>()
  })

  it('should match [start: Point]', () => {
    expectTypeOf<TestSubject>().toHaveProperty('start').toEqualTypeOf<Point>()
  })
})
