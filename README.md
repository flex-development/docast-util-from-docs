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
- [Syntax](#syntax)
- [Syntax tree](#syntax-tree)
- [Types](#types)
- [Contribute](#contribute)

## What is this?

This package is a utility that takes [docblock][docblock] input and turns it into a [docast][docast] syntax tree.

This utility turns docblocks into tokens, and then turns those tokens into nodes. Markdown in docblocks is turned into
tokens using [micromark][micromark], and turned into nodes using [mdast-util-from-markdown][mdast-util-from-markdown].

## When should I use this?

**TODO**: when should i use this?

## Install

This package is [ESM only][esm].

```sh
yarn add @flex-development/docast-util-from-docs @flex-development/docast @types/mdast @types/unist
```

From Git:

```sh
yarn add @flex-development/docast-util-from-docs@flex-development/docast-util-from-docs
```

<blockquote>
  <small>
    See <a href='https://yarnpkg.com/protocol/git'>Git - Protocols | Yarn</a>
    &nbsp;for details on requesting a specific branch, commit, or tag.
  </small>
</blockquote>

## Use

**TODO**: use

## API

**TODO**: api

## Syntax

**TODO**: syntax

## Syntax tree

The syntax tree is [docast][docast].

## Types

This package is fully typed with [TypeScript][typescript].

## Contribute

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

[docast]: https://github.com/flex-development/docast
[docblock]: https://github.com/flex-development/docast#docblock-comment
[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
[mdast-util-from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown
[micromark]: https://github.com/micromark/micromark
[typescript]: https://www.typescriptlang.org
