/**
 * @file Type Definitions - Transform
 * @module docast-util-from-docs/types/Transform
 */

import type { Root } from '@flex-development/docast'

/**
 * Transform the docblock syntax `tree`.
 *
 * @see {@linkcode Root}
 *
 * @this {void}
 *
 * @param {Root} tree - docast tree
 * @return {void} Nothing
 */
type Transform = (this: void, tree: Root) => void

export type { Transform as default }
