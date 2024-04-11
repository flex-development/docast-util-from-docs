/**
 * @file Unit Tests - Reader
 * @module docast-util-from-docs/tests/unit/Reader
 */

import { set } from '@flex-development/tutils'
import { read } from 'to-vfile'
import type { VFile } from 'vfile'
import TestSubject from '../reader'

describe('unit:Reader', () => {
  let document: string
  let file: VFile
  let length: number

  beforeAll(async () => {
    file = await read('__fixtures__/dbl-linear.ts')
    length = (document = String(file)).length
  })

  describe('#char', () => {
    it('should return current character without changing position', () => {
      // Arrange
      const k: number = 0
      const subject: TestSubject = new TestSubject(file)

      // Act + Expect
      expect(subject.char).to.eq(subject.peek(k)).and.eq(subject.peek(k))
    })
  })

  describe('#eof', () => {
    it('should return false if #index < #document length', () => {
      expect(new TestSubject(file).eof).to.be.false
    })

    it('should return true if #index === #document length', () => {
      expect(new TestSubject('').eof).to.be.true
    })

    it('should return true if #index > #document length', () => {
      // Arrange
      const subject: TestSubject = new TestSubject(file)

      // Act + Expect
      expect(set(subject, 'position', length + 1).eof).to.be.true
    })
  })

  describe('#index', () => {
    it('should return current position in #document', () => {
      expect(new TestSubject(file)).to.have.property('index', 0)
    })
  })

  describe('#peek', () => {
    let subject: TestSubject

    beforeAll(() => {
      subject = new TestSubject(file)
    })

    it('should return next k-th character without changing position', () => {
      // Arrange
      const k: number = 4

      // Act + Expect
      expect(subject.peek(k)).to.eq(document[k]).and.eq(subject.peek(k))
    })

    it('should return null if peeking past end of #document', () => {
      expect(subject.peek(length)).to.be.null.and.eq(subject.peek(length))
    })
  })

  describe('#peekMatch', () => {
    let subject: TestSubject

    afterEach(() => {
      set(subject, 'position', 0)
    })

    beforeAll(() => {
      subject = new TestSubject(file)
    })

    it('should return next match without changing position', () => {
      // Arrange
      const re: RegExp = /^\/\*{1,2}.*?\*\//s

      // Act + Expect
      expect(subject.peekMatch(re)).to.eql(subject.peekMatch(re)).and.not.null
    })

    it('should return null if no match at current position', () => {
      // Arrange
      const re: RegExp = /^\/{2}.*?(?=[\n\r])/s
      re.lastIndex = document.lastIndexOf('// increase of index of x')

      // Act + Expect
      expect(re.lastIndex).to.be.greaterThan(-1).and.not.eq(subject.index)
      expect(subject.peekMatch(re)).to.be.null.and.eql(subject.peekMatch(re))
    })
  })

  describe('#read', () => {
    let subject: TestSubject

    afterEach(() => {
      set(subject, 'position', 0)
    })

    beforeAll(() => {
      subject = new TestSubject(file)
    })

    it('should return next k-th character', () => {
      expect(subject.read()).to.equal(document[1])
      expect(subject.read()).to.equal(document[2])
      expect(subject.read()).to.equal(document[3])
    })

    it('should return null if reading past end of #document', () => {
      expect(subject.read(length)).to.be.null
    })
  })
})
