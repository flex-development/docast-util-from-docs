/**
 * @file Unit Tests - TokenKind
 * @module docast-util-from-docs/enums/tests/unit-d/TokenKind
 */

import type TestSubject from '../token-kind'

describe('unit-d:enums/TokenKind', () => {
  it('should match [closer: "closer"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('closer')
      .toMatchTypeOf<'closer'>()
  })

  it('should match [delimiter: "delimiter"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('delimiter')
      .toMatchTypeOf<'delimiter'>()
  })

  it('should match [eof: "eof"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('eof')
      .toMatchTypeOf<'eof'>()
  })

  it('should match [markdown: "markdown"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('markdown')
      .toMatchTypeOf<'markdown'>()
  })

  it('should match [opener: "opener"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('opener')
      .toMatchTypeOf<'opener'>()
  })

  it('should match [tag: "tag"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('tag')
      .toMatchTypeOf<'tag'>()
  })

  it('should match [typeExpression: "typeExpression"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('typeExpression')
      .toMatchTypeOf<'typeExpression'>()
  })

  it('should match [whitespace: "whitespace"]', () => {
    expectTypeOf<typeof TestSubject>()
      .toHaveProperty('whitespace')
      .toMatchTypeOf<'whitespace'>()
  })
})
