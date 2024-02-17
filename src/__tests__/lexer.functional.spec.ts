/**
 * @file Functional Tests - Lexer
 * @module docast-util-from-docs/tests/Lexer/functional
 */

import { read } from 'to-vfile'
import TestSubject from '../lexer'

describe('functional:Lexer', () => {
  let subject: TestSubject

  beforeAll(async () => {
    subject = new TestSubject(await read('__fixtures__/detect-syntax.ts'))
  })

  describe('#tokenize', () => {
    it('should tokenize #document', () => {
      // Act
      subject.tokenize()

      // Expect
      expect(subject.tokens).toMatchSnapshot()
    })
  })
})
