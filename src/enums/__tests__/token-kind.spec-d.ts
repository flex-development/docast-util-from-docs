/**
 * @file Unit Tests - TokenKind
 * @module docast-util-from-docs/enums/tests/unit-d/TokenKind
 */

import type TestSubject from '../token-kind'

describe('unit-d:enums/TokenKind', () => {
  it('should match [BLOCK_TAG: "blockTag"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('BLOCK_TAG')
      .toMatchTypeOf<'blockTag'>()
  })

  it('should match [BLOCK_TAG_ID: "blockTagId"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('BLOCK_TAG_ID')
      .toMatchTypeOf<'blockTagId'>()
  })

  it('should match [BLOCK_TAG_TEXT: "blockTagText"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('BLOCK_TAG_TEXT')
      .toMatchTypeOf<'blockTagText'>()
  })

  it('should match [COMMENT: "comment"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('COMMENT')
      .toMatchTypeOf<'comment'>()
  })

  it('should match [DESCRIPTION: "description"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('DESCRIPTION')
      .toMatchTypeOf<'description'>()
  })

  it('should match [INLINE_TAG: "inlineTag"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('INLINE_TAG')
      .toMatchTypeOf<'inlineTag'>()
  })

  it('should match [INLINE_TAG_ID: "inlineTagId"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('INLINE_TAG_ID')
      .toMatchTypeOf<'inlineTagId'>()
  })

  it('should match [INLINE_TAG_VALUE: "inlineTagValue"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('INLINE_TAG_VALUE')
      .toMatchTypeOf<'inlineTagValue'>()
  })

  it('should match [TYPE_EXPRESSION: "typeExpression"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('TYPE_EXPRESSION')
      .toMatchTypeOf<'typeExpression'>()
  })
})
