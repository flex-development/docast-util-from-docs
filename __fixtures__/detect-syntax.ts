/**
 * @file Fixtures - detectSyntax
 * @module fixtures/detectSyntax
 */

import { hasCJSSyntax, hasESMSyntax } from '@flex-development/mlly'

/**
 * Detects if `code` contains CommonJS syntax, ESM syntax, or a mixture of both.
 *
 * Ignores matches in comments.
 *
 * @see {@linkcode hasCJSSyntax}
 * @see {@linkcode hasESMSyntax}
 *
 * @example
 *  import { detectSyntax } from '@flex-development/mlly'
 *
 *  console.debug(detectSyntax('export default {}'))
 *
 * @param {string} code - Code to evaluate
 * @return {{
 *  cjs: boolean;
 *  esm: boolean;
 *  mixed: boolean
 * }} Detection result
 */
const detectSyntax = (
  code: string
): { cjs: boolean; esm: boolean; mixed: boolean } => {
  /**
   * CommonJS syntax check.
   *
   * @const {boolean} cjs
   */
  const cjs: boolean = hasCJSSyntax(code)

  /**
   * ESM syntax check.
   *
   * @const {boolean} esm
   */
  const esm: boolean = hasESMSyntax(code)

  return { cjs, esm, mixed: cjs && esm }
}

export default detectSyntax
