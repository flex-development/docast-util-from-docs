/**
 * @file E2E Tests - api
 * @module docast-util-from-docs/tests/e2e/api
 */

import * as testSubject from '../index'

describe('e2e:docast-util-from-docs', () => {
  it('should expose public api', () => {
    expect(testSubject).to.have.keys(['fromDocs', 'parseMarkdown'])
  })
})
