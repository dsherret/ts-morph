ts-simple-ast
=============

[![npm version](https://badge.fury.io/js/ts-simple-ast.svg)](https://badge.fury.io/js/ts-simple-ast)
[![Build Status](https://travis-ci.org/dsherret/ts-simple-ast.svg)](https://travis-ci.org/dsherret/ts-simple-ast)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-simple-ast/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-simple-ast?branch=master)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

TypeScript compiler wrapper. Provides a simple way to navigate and manipulate the TypeScript AST.

## Library Development - Progress Update (03 June 2017)

* Most AST navigation is implemented, but still some missing. This library can be used to help you easily navigate the TypeScript compiler's AST.
* Code manipulation/generation is making steady progress, but it's not very usable at this point. Most common manipulation tasks should be done within a month.

## Simple Layer

*ts-simple-ast* adds a layer over the compiler while still providing access to the underlying TypeScript compiler AST.

1. Simple Layer - Provides a simple way for navigating and manipulating the AST.
2. Compiler Layer - TypeScript compiler objects.

Changes made in the simple layer will be made to the underlying compiler layer.

## Documentation

Work in progress: https://dsherret.github.io/ts-simple-ast/

## Example

```typescript
import Ast from "ts-simple-ast";

// add source files to ast
const ast = new Ast();
const sourceFile = ast.addSourceFileFromText("MyFile.ts", "enum MyEnum {}\nlet myEnum: MyEnum;\nexport default MyEnum;");

// get information from ast
const enumDeclaration = sourceFile.getEnum("MyEnum")!;
enumDeclaration.getName();          // returns: "MyEnum"
enumDeclaration.hasExportKeyword(); // returns: false
enumDeclaration.isDefaultExport();  // returns: true

// manipulate ast
enumDeclaration.setName("NewName");
enumDeclaration.addMember({
    name: "myNewMember"
});
enumDeclaration.setIsDefaultExport(false);

// result
sourceFile.getFullText(); // returns: "enum NewName {\n    myNewMember\n}\nlet myEnum: NewName;"
sourceFile.save();        // save it to MyFile.ts

// get underlying compiler node from the typescript AST from any node
const sourceFileNode = sourceFile.getCompilerNode();
```
