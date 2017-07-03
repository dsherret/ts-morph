ts-simple-ast
=============

[![npm version](https://badge.fury.io/js/ts-simple-ast.svg)](https://badge.fury.io/js/ts-simple-ast)
[![Build Status](https://travis-ci.org/dsherret/ts-simple-ast.svg)](https://travis-ci.org/dsherret/ts-simple-ast)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-simple-ast/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-simple-ast?branch=master)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

TypeScript compiler wrapper. Provides a simple way to navigate and manipulate the TypeScript AST.

## Library Development - Progress Update (03 July 2017)

* Most AST navigation is implemented, but still some missing. This library can be used to help you easily navigate the TypeScript compiler's AST.
* Code manipulation/generation is making steady progress and is somewhat useable at this point. There's still lots to do.

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
ast.addSourceFiles("folder/**/*{.d.ts,.ts}");
ast.addSourceFiles("otherFolder/file.ts", "specifyAnotherFile.ts", "orAnotherGlob/**/*.ts");
ast.addSourceFile("misc.ts", {
    classes: [{
        name: "MyClass",
        isExported: true
    }],
    enums: [{
        name: "MyEnum",
        isExported: true,
        members: [{ name: "member" }]
    }]
});

// get information from ast
const enumDeclaration = sourceFile.getEnum("MyEnum")!;
enumDeclaration.getName();          // returns: "MyEnum"
enumDeclaration.hasExportKeyword(); // returns: false
enumDeclaration.isDefaultExport();  // returns: true

// manipulate ast
enumDeclaration.rename("NewName");
enumDeclaration.addMember({
    name: "myNewMember"
});
enumDeclaration.setIsDefaultExport(false);

// result
sourceFile.getFullText(); // returns: "enum NewName {\n    myNewMember\n}\nlet myEnum: NewName;"
sourceFile.save();        // save it to MyFile.ts

// get underlying compiler node from the typescript AST from any node
const sourceFileCompilerNode = sourceFile.node;
```

Or navigate existing compiler nodes created outside this library:

```typescript
import * as ts from "typescript";
import {createWrappedNode, ClassDeclaration} from "ts-simple-ast";

// some code that creates a class declaration (could be any kind of ts.Node)
const classNode: ts.ClassDeclaration = ...; 

// create and use a wrapped node
const classDec = createWrappedNode(classNode) as ClassDeclaration;
const firstProperty = classDec.getProperties()[0];

// ... do more stuff here ...
```
