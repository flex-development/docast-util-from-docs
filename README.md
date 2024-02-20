# docast-util-from-docs

[![github release](https://img.shields.io/github/v/release/flex-development/docast-util-from-docs.svg?include_prereleases&sort=semver)](https://github.com/flex-development/docast-util-from-docs/releases/latest)
[![npm](https://img.shields.io/npm/v/@flex-development/docast-util-from-docs.svg)](https://npmjs.com/package/@flex-development/docast-util-from-docs)
[![codecov](https://codecov.io/gh/flex-development/docast-util-from-docs/graph/badge.svg?token=um87Ekggjn)](https://codecov.io/gh/flex-development/docast-util-from-docs)
[![module type: esm](https://img.shields.io/badge/module%20type-esm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm)
[![license](https://img.shields.io/github/license/flex-development/docast-util-from-docs.svg)](LICENSE.md)
[![conventional commits](https://img.shields.io/badge/-conventional%20commits-fe5196?logo=conventional-commits&logoColor=ffffff)](https://conventionalcommits.org/)
[![typescript](https://img.shields.io/badge/-typescript-3178c6?logo=typescript&logoColor=ffffff)](https://typescriptlang.org/)
[![vitest](https://img.shields.io/badge/-vitest-6e9f18?style=flat&logo=vitest&logoColor=ffffff)](https://vitest.dev/)
[![yarn](https://img.shields.io/badge/-yarn-2c8ebb?style=flat&logo=yarn&logoColor=ffffff)](https://yarnpkg.com/)

[**docast**][docast] utility that turns docblocks into a syntax tree.

## Contents

- [What is this?](#what-is-this)
- [When should I use this?](#when-should-i-use-this)
- [Install](#install)
- [Use](#use)
- [API](#api)
  - [`fromDocs(value[, options])`](#fromdocsvalue-options)
  - [`Options`](#options)
  - [`Transform`](#transform)
- [Syntax](#syntax)
  - [Docblock](#docblock)
  - [Markdown](#markdown)
- [Syntax tree](#syntax-tree)
- [Types](#types)
- [Contribute](#contribute)

## What is this?

This package is a utility that takes [docblock][docblock] input and turns it into a [docast][docast] syntax tree.

This utility turns docblocks into tokens, and then turns those tokens into nodes. Markdown in docblocks is turned into
tokens using [micromark][micromark], and turned into nodes using [mdast-util-from-markdown][mdast-util-from-markdown].
This package is also the backbone of [`docast-parse`][docast-parse], a [**unified**][unified] compliant file parser that
focuses on making it easier to transform docblocks by abstracting these internals away.

## When should I use this?

**TODO**: ecosystem

If you want to handle syntax trees manually, use this. For an easier time processing docblocks, use
[`docast-parse`][docast-parse] instead.

## Install

This package is [ESM only][esm].

In Node.js (version 18+) with [yarn][yarn]:

```sh
yarn add @flex-development/docast-util-from-docs
yarn add -D @flex-development/docast @types/mdast @types/unist micromark-util-types
```

<blockquote>
  <small>
    See <a href='https://yarnpkg.com/protocol/git'>Git - Protocols | Yarn</a>
    &nbsp;for details regarding installing from Git.
  </small>
</blockquote>

In Deno with [`esm.sh`][esmsh]:

```ts
import { fromDocs } from 'https://esm.sh/@flex-development/docast-util-from-docs'
```

## Use

Say we have the following TypeScript file `fibonacci-sequence.ts`:

````ts
/**
 * @file FibonacciSequence
 * @module FibonacciSequence
 * @see https://codewars.com/kata/55695bc4f75bbaea5100016b
 */

/**
 * Fibonacci sequence iterator.
 *
 * :::info
 * A fibonacci sequence starts with two `1`s. Every element afterwards is the
 * sum of the two previous elements:
 * ```txt
 * 1, 1, 2, 3, 5, 8, 13, ..., 89, 144, 233, 377, ...
 * ```
 * :::
 *
 * @implements {Iterator<number, number>}
 */
class FibonacciSequence implements Iterator<number, number> {
  /**
   * First managed sequence value.
   *
   * @public
   * @instance
   * @member {number} fib1
   */
  public fib1: number

  /**
   * Second managed sequence value.
   *
   * @public
   * @instance
   * @member {number} fib2
   */
  public fib2: number

  /**
   * Max sequence value.
   *
   * @private
   * @instance
   * @member {number} max
   */
  readonly #max: number

  /**
   * Create a new fibonacci sequence iterator.
   *
   * @param {number} [max=Number.MAX_SAFE_INTEGER] - Max sequence value
   */
  constructor(max: number = Number.MAX_SAFE_INTEGER) {
    this.#max = max < 0 ? 0 : max
    this.fib1 = this.fib2 = 1
  }

  /**
   * Iterable protocol.
   *
   * @public
   * @instance
   *
   * @return {IterableIterator<number>} Current sequence iterator
   */
  public [Symbol.iterator](): IterableIterator<number> {
    return this
  }

  /**
   * Get the next value in the fibonacci sequence.
   *
   * @public
   * @instance
   *
   * @return {IteratorResult<number, number>} Next sequence value
   */
  public next(): IteratorResult<number, number> {
    /**
     * Temporary sequence value.
     *
     * @const {number} value
     */
    const value: number = this.fib1

    // reset current sequence values
    this.fib1 = this.fib2
    this.fib2 = value + this.fib1

    return { done: value >= this.#max, value }
  }
}

export default FibonacciSequence
````

…and our module `example.mjs` looks as follows:

```js
import { fromDocs } from '@flex-development/docast-util-from-docs'
import { directiveFromMarkdown } from 'mdast-util-directive'
import { directive } from 'micromark-extension-directive'
import { read } from 'to-vfile'
import { inspect } from 'unist-util-inspect'

const file = await read('fibonacci-sequence.ts')

const tree = fromDocs(file, {
  mdastExtensions: [directiveFromMarkdown()],
  micromarkExtensions: [directive()]
})

console.log(inspect(tree))
```

…now running `node example.mjs` yields:

```sh
root[9]
├─0 comment[3] (1:1-5:4, 0-122)
│   │ code: null
│   ├─0 blockTag<file>[1] (2:4-2:27, 7-30)
│   │   │ tag: "@file"
│   │   └─0 text "FibonacciSequence" (2:10-2:27, 13-30)
│   ├─1 blockTag<module>[1] (3:4-3:29, 34-59)
│   │   │ tag: "@module"
│   │   └─0 text "FibonacciSequence" (3:12-3:29, 42-59)
│   └─2 blockTag<see>[1] (4:4-4:59, 63-118)
│       │ tag: "@see"
│       └─0 text "https://codewars.com/kata/55695bc4f75bbaea5100016b" (4:9-4:59, 68-118)
├─1 comment[2] (7:1-19:4, 124-414)
│   │ code: null
│   ├─0 description[4] (8:4-16:7, 131-365)
│   │   ├─0 paragraph[1] (8:4-8:32, 131-159)
│   │   │   └─0 text "Fibonacci sequence iterator." (8:4-8:32, 131-159)
│   │   ├─1 break (8:32-9:1, 159-160)
│   │   ├─2 break (9:3-10:1, 162-163)
│   │   │     data: {"blank":true}
│   │   └─3 containerDirective<info>[2] (10:4-16:7, 166-365)
│   │       │ attributes: {}
│   │       ├─0 paragraph[3] (11:4-12:37, 177-288)
│   │       │   ├─0 text "A fibonacci sequence starts with two " (11:4-11:41, 177-214)
│   │       │   ├─1 inlineCode "1" (11:41-11:44, 214-217)
│   │       │   └─2 text "s. Every element afterwards is the sum of the two previous elements:" (11:44-12:37, 217-288)
│   │       └─1 code "1, 1, 2, 3, 5, 8, 13, ..., 89, 144, 233, 377, ..." (13:4-15:7, 292-358)
│   │             lang: "txt"
│   │             meta: null
│   └─1 blockTag<implements>[1] (18:4-18:42, 372-410)
│       │ tag: "@implements"
│       └─0 typeExpression "Iterator<number, number>" (18:16-18:42, 384-410)
├─2 comment[4] (21:3-27:6, 479-583)
│   │ code: null
│   ├─0 description[1] (22:6-22:35, 488-517)
│   │   └─0 paragraph[1] (22:6-22:35, 488-517)
│   │       └─0 text "First managed sequence value." (22:6-22:35, 488-517)
│   ├─1 blockTag<public>[0] (24:6-24:13, 528-535)
│   │     tag: "@public"
│   ├─2 blockTag<instance>[0] (25:6-25:15, 541-550)
│   │     tag: "@instance"
│   └─3 blockTag<member>[2] (26:6-26:27, 556-577)
│       │ tag: "@member"
│       ├─0 typeExpression "number" (26:14-26:22, 564-572)
│       └─1 text "fib1" (26:23-26:27, 573-577)
├─3 comment[4] (30:3-36:6, 609-714)
│   │ code: null
│   ├─0 description[1] (31:6-31:36, 618-648)
│   │   └─0 paragraph[1] (31:6-31:36, 618-648)
│   │       └─0 text "Second managed sequence value." (31:6-31:36, 618-648)
│   ├─1 blockTag<public>[0] (33:6-33:13, 659-666)
│   │     tag: "@public"
│   ├─2 blockTag<instance>[0] (34:6-34:15, 672-681)
│   │     tag: "@instance"
│   └─3 blockTag<member>[2] (35:6-35:27, 687-708)
│       │ tag: "@member"
│       ├─0 typeExpression "number" (35:14-35:22, 695-703)
│       └─1 text "fib2" (35:23-35:27, 704-708)
├─4 comment[4] (39:3-45:6, 740-834)
│   │ code: null
│   ├─0 description[1] (40:6-40:25, 749-768)
│   │   └─0 paragraph[1] (40:6-40:25, 749-768)
│   │       └─0 text "Max sequence value." (40:6-40:25, 749-768)
│   ├─1 blockTag<private>[0] (42:6-42:14, 779-787)
│   │     tag: "@private"
│   ├─2 blockTag<instance>[0] (43:6-43:15, 793-802)
│   │     tag: "@instance"
│   └─3 blockTag<member>[2] (44:6-44:26, 808-828)
│       │ tag: "@member"
│       ├─0 typeExpression "number" (44:14-44:22, 816-824)
│       └─1 text "max" (44:23-44:26, 825-828)
├─5 comment[2] (48:3-52:6, 862-995)
│   │ code: null
│   ├─0 description[1] (49:6-49:47, 871-912)
│   │   └─0 paragraph[1] (49:6-49:47, 871-912)
│   │       └─0 text "Create a new fibonacci sequence iterator." (49:6-49:47, 871-912)
│   └─1 blockTag<param>[2] (51:6-51:72, 923-989)
│       │ tag: "@param"
│       ├─0 typeExpression "number" (51:13-51:21, 930-938)
│       └─1 text "[max=Number.MAX_SAFE_INTEGER] - Max sequence value" (51:22-51:72, 939-989)
├─6 comment[4] (58:3-65:6, 1122-1259)
│   │ code: null
│   ├─0 description[1] (59:6-59:24, 1131-1149)
│   │   └─0 paragraph[1] (59:6-59:24, 1131-1149)
│   │       └─0 text "Iterable protocol." (59:6-59:24, 1131-1149)
│   ├─1 blockTag<public>[0] (61:6-61:13, 1160-1167)
│   │     tag: "@public"
│   ├─2 blockTag<instance>[0] (62:6-62:15, 1173-1182)
│   │     tag: "@instance"
│   └─3 blockTag<return>[2] (64:6-64:66, 1193-1253)
│       │ tag: "@return"
│       ├─0 typeExpression "IterableIterator<number>" (64:14-64:40, 1201-1227)
│       └─1 text "Current sequence iterator" (64:41-64:66, 1228-1253)
├─7 comment[4] (70:3-77:6, 1340-1504)
│   │ code: null
│   ├─0 description[1] (71:6-71:51, 1349-1394)
│   │   └─0 paragraph[1] (71:6-71:51, 1349-1394)
│   │       └─0 text "Get the next value in the fibonacci sequence." (71:6-71:51, 1349-1394)
│   ├─1 blockTag<public>[0] (73:6-73:13, 1405-1412)
│   │     tag: "@public"
│   ├─2 blockTag<instance>[0] (74:6-74:15, 1418-1427)
│   │     tag: "@instance"
│   └─3 blockTag<return>[2] (76:6-76:66, 1438-1498)
│       │ tag: "@return"
│       ├─0 typeExpression "IteratorResult<number, number>" (76:14-76:46, 1446-1478)
│       └─1 text "Next sequence value" (76:47-76:66, 1479-1498)
└─8 comment[2] (79:5-83:8, 1559-1639)
    │ code: null
    ├─0 description[1] (80:8-80:33, 1570-1595)
    │   └─0 paragraph[1] (80:8-80:33, 1570-1595)
    │       └─0 text "Temporary sequence value." (80:8-80:33, 1570-1595)
    └─1 blockTag<const>[2] (82:8-82:29, 1610-1631)
        │ tag: "@const"
        ├─0 typeExpression "number" (82:15-82:23, 1617-1625)
        └─1 text "value" (82:24-82:29, 1626-1631)
```

## API

This package exports the identifier [`fromDocs`](#fromdocsvalue-options). There is no default export.

### `fromDocs(value[, options])`

Turn docblocks into a syntax tree.

#### Parameters

- `value` ([`VFile`][vfile] | `string`) &mdash; source document or file containing docblocks to parse
- `options` ([`Options`](#options), optional) &mdash; configuration options

#### Returns

docast tree ([`Root`][docast-tree])

### `Options`

Configuration options (TypeScript type).

#### Properties

- `codeblocks` (`OneOrMany<RegExp | string>`, optional) &mdash; block tag node names and tags, or regular
  expressions, matching block tags that should have their text converted to [`Code`][mdast-code] when parsed as markdown
  - **default**: `'example'`
- `mdastExtensions` ([`MdastExtension[]`][mdast-util-extension], optional) &mdash; markdown extensions to change how
  micromark tokens are converted to nodes
- `micromarkExtensions` ([`MicromarkExtension[]`][micromark-extension], optional) &mdash; micromark extensions to change
  how markdown is parsed
- `transforms` ([`Transform[]`](#transform), optional) &mdash; tree transforms

### `Transform`

Change the AST after parsing is complete (TypeScript type).

#### Parameters

- `tree` ([`Root`][docast-tree]) &mdash; tree to transform

#### Returns

Nothing

## Syntax

### Docblock

**TODO**: docblock syntax

### Markdown

Markdown is parsed according to CommonMark. Extensions can add support for other syntax and nodes. If you’re interested
in extending markdown, more information is available in the [`mdast-util-from-markdown`][mdast-util-from-markdown] and
[`micromark`][micromark] readmes.

## Syntax tree

The syntax tree is [docast][docast].

## Types

This package is fully typed with [TypeScript][typescript].

## Contribute

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

[docast-parse]: https://github.com/flex-development/docast-parse
[docast-tree]: https://github.com/flex-development/docast#root
[docast]: https://github.com/flex-development/docast
[docblock]: https://github.com/flex-development/docast#docblock-comment
[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
[esmsh]: https://esm.sh/
[mdast-code]: https://github.com/syntax-tree/mdast#code
[mdast-util-extension]: https://github.com/syntax-tree/mdast-util-from-markdown#extension
[mdast-util-from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown
[micromark-extension]: https://github.com/micromark/micromark#extensions
[micromark]: https://github.com/micromark/micromark
[typescript]: https://www.typescriptlang.org
[unified]: https://github.com/unifiedjs/unified
[vfile]: https://github.com/vfile/vfile#api
[yarn]: https://yarnpkg.com
