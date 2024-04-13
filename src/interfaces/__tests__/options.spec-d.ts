/**
 * @file Type Tests - Options
 * @module docast-util-from-docs/interfaces/tests/unit-d/Options
 */

import type { Transform } from '#src/types'
import type { Point } from '@flex-development/docast'
import type { Nilable, OneOrMany } from '@flex-development/tutils'
import type { Extension as MdastExtension } from 'mdast-util-from-markdown'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import type TestSubject from '../options'

describe('unit-d:interfaces/Options', () => {
  it('should match [codeblocks?: Nilable<OneOrMany<RegExp | string>>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('codeblocks')
      .toEqualTypeOf<Nilable<OneOrMany<RegExp | string>>>()
  })

  it('should match [from?: Nilable<Point>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('from')
      .toEqualTypeOf<Nilable<Point>>()
  })

  it('should match [mdastExtensions?: Nilable<MdastExtension[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('mdastExtensions')
      .toEqualTypeOf<Nilable<MdastExtension[]>>()
  })

  it('should match [micromarkExtensions?: Nilable<MicromarkExtension[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('micromarkExtensions')
      .toEqualTypeOf<Nilable<MicromarkExtension[]>>()
  })

  it('should match [transforms?: Nilable<Transform[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('transforms')
      .toEqualTypeOf<Nilable<Transform[]>>()
  })
})
