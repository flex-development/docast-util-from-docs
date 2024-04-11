/**
 * @file Enums - types
 * @module docast-util-from-docs/enums/types
 */

import type { Root } from '@flex-development/docast'
import type {
  InclusiveDescendant,
  Type
} from '@flex-development/unist-util-types'

/**
 * Node types.
 *
 * @enum {Type<InclusiveDescendant<Root>>}
 */
enum types {
  blockTag = 'blockTag',
  blockquote = 'blockquote',
  break = 'break',
  code = 'code',
  comment = 'comment',
  containerDirective = 'containerDirective',
  definition = 'definition',
  delete = 'delete',
  description = 'description',
  emphasis = 'emphasis',
  footnoteDefinition = 'footnoteDefinition',
  footnoteReference = 'footnoteReference',
  heading = 'heading',
  html = 'html',
  image = 'image',
  imageReference = 'imageReference',
  inlineCode = 'inlineCode',
  inlineTag = 'inlineTag',
  leafDirective = 'leafDirective',
  link = 'link',
  linkReference = 'linkReference',
  list = 'list',
  listItem = 'listItem',
  paragraph = 'paragraph',
  root = 'root',
  strong = 'strong',
  table = 'table',
  tableCell = 'tableCell',
  tableRow = 'tableRow',
  text = 'text',
  textDirective = 'textDirective',
  thematicBreak = 'thematicBreak',
  typeExpression = 'typeExpression'
}

export default types
