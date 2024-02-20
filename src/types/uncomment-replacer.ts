/**
 * @file Type Definitions - UncommentReplacer
 * @module docast-util-from-docs/types/UncommentReplacer
 */

/**
 * Get the replacement text for a comment delimiter sequence in `input`.
 *
 * @see https://regex101.com/r/SRSLca
 *
 * @internal
 *
 * @param {string} match - Comment delimiter sequence match
 * @param {number} index - Start index of `match`
 * @param {string} input - Original input
 * @return {string} Replacement text
 */
type UncommentReplacer = (match: string, index: number, input: string) => string

export type { UncommentReplacer as default }
