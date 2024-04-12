import type { TokenKind } from '#src/enums'
import type { Position } from '@flex-development/docast'
import type {} from 'typescript-parsec'

declare module 'typescript-parsec' {
  interface Token<T extends TokenKind = TokenKind> extends Readonly<Position> {
    readonly kind: T
  }
}
