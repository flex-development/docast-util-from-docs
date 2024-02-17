/**
 * @file Unit Tests - Lexer
 * @module docast-util-from-docs/tests/Lexer/unit
 */

import { define } from '@flex-development/tutils'
import { read } from 'to-vfile'
import type { VFile } from 'vfile'
import TestSubject from '../lexer'

describe('unit:Lexer', () => {
  let file: VFile
  let length: number

  beforeAll(async () => {
    file = await read('__fixtures__/dbl-linear.ts')
    length = String(file).length
  })

  describe('#eof', () => {
    it('should return false if #index < #document length', () => {
      expect(new TestSubject(file).eof).to.be.false
    })

    it('should return true if #index ==== #document length', () => {
      // Arrange
      const subject: TestSubject = new TestSubject(file)
      define(subject, 'index', { value: length })

      // Act + Expect
      expect(subject.eof).to.be.true
    })

    it('should return true if #index > #document length', () => {
      // Arrange
      const subject: TestSubject = new TestSubject(file)
      define(subject, 'index', { value: length + faker.number.int() })

      // Act + Expect
      expect(subject.eof).to.be.true
    })

    it('should return true if #document is empty', () => {
      expect(new TestSubject('').eof).to.be.true
    })
  })

  describe('#point', () => {
    let subject: TestSubject

    beforeAll(() => {
      subject = new TestSubject(file)
    })

    it('should return invalid point if offset < 0', () => {
      // Arrange
      const offset: number = faker.number.int({
        max: -1,
        min: Number.NEGATIVE_INFINITY
      })

      // Act + Expect
      expect(subject.point(offset)).to.eql({ column: -1, line: -1, offset })
    })

    it('should return invalid point if offset > #document length', () => {
      // Arrange
      const offset: number = faker.number.int({ min: length + 1 })

      // Act + Expect
      expect(subject.point(offset)).to.eql({ column: -1, line: -1, offset })
    })

    it('should return invalid point if offset is not an integer', () => {
      // Arrange
      const offset: number = faker.number.float({ max: length, min: 0 })

      // Act + Expect
      expect(subject.point(offset)).to.eql({ column: -1, line: -1, offset })
    })

    it('should return point if offset is in range [0,#document length]', () => {
      expect(subject.point(length)).to.eql({
        column: 1,
        line: 64,
        offset: length
      })
    })
  })
})
