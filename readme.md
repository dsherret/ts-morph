ts-simple-ast
=============

[![Build Status](https://travis-ci.org/dsherret/ts-simple-ast.svg)](https://travis-ci.org/dsherret/ts-simple-ast)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-simple-ast/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-simple-ast?branch=master)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

TypeScript compiler wrapper.

## Layers

*ts-simple-ast* add two additional layers of abstraction over the compiler layer:

1. Simple Layer - Provides a simple way for navigating and manipulating the AST.
2. Wrapper Layer - Wrapped typescript compiler objects.
3. Compiler Layer - TypeScript compiler objects.

As you go down the layers, it gets more complex and the api's likelyhood of changing increases. For that reason, it's best to stay in the simple layer as much as possible.

Changes made in any of the layers will be made to the underlying compiler layer.

## Project Goal

Provide a simple way to navigate and manipulate the TypeScript AST.
