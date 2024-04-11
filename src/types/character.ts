/**
 * @file Type Aliases - Character
 * @module docast-util-from-docs/types/Character
 */

import type { Nullable } from '@flex-development/tutils'

/**
 * Character in a source [*file*][file], with `null` denoting the end of the
 * character stream.
 *
 * [file]: https://github.com/syntax-tree/unist#file
 */
type Character = Nullable<string>

export type { Character as default }
