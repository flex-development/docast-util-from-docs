/**
 * @file Type Tests - Options
 * @module docast-util-from-docs/interfaces/tests/unit-d/Options
 */

import type { Transform } from '#src/types'
import type { Nilable, OneOrMany } from '@flex-development/tutils'
import type * as mdast from 'mdast-util-from-markdown'
import type * as micromark from 'micromark-util-types'
import type TestSubject from '../options'

describe('unit-d:interfaces/Options', () => {
  it('should match [codeblocks?: Nilable<OneOrMany<RegExp | string>>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('codeblocks')
      .toEqualTypeOf<Nilable<OneOrMany<RegExp | string>>>()
  })

  it('should match [mdastExtensions?: Nilable<mdast.Extension[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('mdastExtensions')
      .toEqualTypeOf<Nilable<mdast.Extension[]>>()
  })

  it('should match [micromarkExtensions?: Nilable<micromark.Extension[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('micromarkExtensions')
      .toEqualTypeOf<Nilable<micromark.Extension[]>>()
  })

  it('should match [transforms?: Nilable<Transform[]>]', () => {
    expectTypeOf<TestSubject>()
      .toHaveProperty('transforms')
      .toEqualTypeOf<Nilable<Transform[]>>()
  })
})
