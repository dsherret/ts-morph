ts-morph
========

[![Build Status](https://travis-ci.org/dsherret/ts-morph.svg?branch=master)](https://travis-ci.org/dsherret/ts-morph)

Monorepo for [ts-morph](packages/ts-morph) and related projects.

* [ts-morph](packages/ts-morph) - [TypeScript](https://github.com/Microsoft/TypeScript) Compiler API wrapper. Provides an easier way to programmatically navigate and manipulate TypeScript and JavaScript code.
* [@ts-morph/bootstrap](packages/bootstrap) - Library for quickly getting setup with the Compiler API.

Sub-packages:

* [@ts-morph/common](packages/common) - Common utilities.
* [@ts-morph/scripts](packages/scripts) - Common scripts used by other packages.
* [@ts-morph/comment-parser](packages/comment-parser) - Comment parser that ts-morph uses for creating comment nodes.
