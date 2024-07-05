/**
 * @file ESLint Configuration - Root
 * @module config/eslint
 * @see https://eslint.org/docs/user-guide/configuring
 */

/**
 * Root eslint configuration object.
 *
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export default [
  ...(await import('./eslint.base.config.mjs')).default,
  {
    ignores: [
      '!**/__fixtures__/**/dist/',
      '!**/__fixtures__/**/node_modules/',
      '!**/typings/**/dist/',
      '**/.yarn/',
      '**/coverage/',
      '**/dist/'
    ]
  },
  {
    files: ['__fixtures__/dbl-linear.ts'],
    rules: {
      '@typescript-eslint/require-await': 0,
      'jsdoc/require-description': 0
    }
  },
  {
    files: ['__fixtures__/validate-url-string.ts'],
    rules: {
      '@typescript-eslint/only-throw-error': 0
    }
  }
]
