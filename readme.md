ts-simple-ast
=============

[![npm version](https://badge.fury.io/js/ts-simple-ast.svg)](https://badge.fury.io/js/ts-simple-ast)
[![Build Status](https://travis-ci.org/dsherret/ts-simple-ast.svg)](https://travis-ci.org/dsherret/ts-simple-ast)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-simple-ast/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-simple-ast?branch=master)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

TypeScript compiler wrapper. Provides a simple way to navigate and manipulate the TypeScript AST.

## Simple Layer

*ts-simple-ast* adds a layer over the compiler while still providing access to the underlying TypeScript compiler AST.

1. Simple Layer - Provides a simple way for navigating and manipulating the AST.
2. Compiler Layer - TypeScript compiler objects.

Changes made in the simple layer will be made to the underlying compiler layer.


## Example

```typescript
import Ast from "ts-simple-ast";

const ast = new Ast();
const sourceFile = ast.addSourceFileFromText("MyFile.ts", "enum MyEnum {}\nlet myEnum: MyEnum;\nexport default MyEnum;");
const enumDeclaration = sourceFile.getEnums()[0];
enumDeclaration.getName(); // "MyEnum"
enumDeclaration.setName("NewName");
enumDeclaration.addMember({
    name: "myNewMember"
});
enumDeclaration.setIsDefaultExport(false);
sourceFile.getFullText(); // "enum NewName {\n    myNewMember\n}\nlet myEnum: NewName;"
const sourceFileNode = sourceFile.getCompilerNode(); // underlying compiler node from the typescript AST
```

## Library Development - Progress Update (06 April 2017)

Most AST navigation is implemented. This library can be currently used to help you easily navigate the TypeScript compiler's AST.

Most code manipulation abilities are not implemented. This will take a few more months before it gets up to speed probably.
