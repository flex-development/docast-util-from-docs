/**
 * @file Unit Tests - Location
 * @module docast-util-from-docs/tests/unit/Location
 */

import type { Offset } from '#src/types'
import type { Point } from '@flex-development/docast'
import { read } from 'to-vfile'
import type { VFile } from 'vfile'
import TestSubject from '../location'

describe('unit:Location', () => {
  let file: VFile
  let length: number
  let points: Point[]

  beforeAll(async () => {
    file = await read('__fixtures__/dbl-linear.ts')
    length = String(file).length
    points = [
      { column: 1, line: 1, offset: 0 },
      { column: 26, line: 39, offset: 965 },
      { column: 13, line: 55, offset: 1368 },
      { column: 1, line: 71, offset: length }
    ]
  })

  describe('#offset', () => {
    let subject: TestSubject

    beforeAll(() => {
      subject = new TestSubject(file)
    })

    it('should return -1 if point.column < 1', () => {
      expect(subject.offset({ column: 0, line: 1 })).to.eq(-1)
    })

    it('should return -1 if point.column is not found', () => {
      expect(subject.offset({ column: 40, line: 2 })).to.eq(-1)
    })

    it('should return -1 if point.line < 1', () => {
      expect(subject.offset({ column: 1, line: 0 })).to.eq(-1)
    })

    it('should return -1 if point.line > total number of lines', () => {
      expect(subject.offset({ column: 1, line: 100 })).to.eq(-1)
    })

    it('should return index of character in #document', () => {
      points.forEach(point => expect(subject.offset(point)).to.eq(point.offset))
    })
  })

  describe('#point', () => {
    let subject: TestSubject

    beforeAll(() => {
      subject = new TestSubject(file)
    })

    it('should return invalid point if offset < 0', () => {
      // Arrange
      const offset: Offset = faker.number.int({
        max: -1,
        min: Number.NEGATIVE_INFINITY
      })

      // Act + Expect
      expect(subject.point(offset)).to.eql({ column: -1, line: -1, offset })
    })

    it('should return invalid point if offset > #document length', () => {
      // Arrange
      const offset: Offset = faker.number.int({ min: length + 1 })

      // Act + Expect
      expect(subject.point(offset)).to.eql({ column: -1, line: -1, offset })
    })

    it('should return invalid point if offset is not an integer', () => {
      // Arrange
      const offset: Offset = faker.number.float({ max: length, min: 0 })

      // Act + Expect
      expect(subject.point(offset)).to.eql({ column: -1, line: -1, offset })
    })

    it('should return point in #document', () => {
      points.forEach(point => expect(subject.point(point.offset)).to.eql(point))
    })
  })
})
