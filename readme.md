ts-simple-ast
=============

[![npm version](https://badge.fury.io/js/ts-simple-ast.svg)](https://badge.fury.io/js/ts-simple-ast)
[![Build Status](https://travis-ci.org/dsherret/ts-simple-ast.svg?branch=master)](https://travis-ci.org/dsherret/ts-simple-ast)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-simple-ast/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-simple-ast?branch=master)
[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[TypeScript](https://github.com/Microsoft/TypeScript) Compiler API wrapper. Provides a simple way to navigate and manipulate TypeScript and JavaScript code.

## Library Development - Progress Update (03 June 2018)

TypeScript 2.9 support is added in v12. View information on breaking changes in [breaking-changes.md](breaking-changes.md).

This library is still under early active development. Most common code manipulation/generation use cases are implemented, but there's still a lot of work to do.

Please open an issue if find a feature missing or bug that isn't in the issue tracker.

### Report

View a generated report on what nodes have been wrapped in the [wrapped-nodes.md](wrapped-nodes.md) file.

## Documentation

Work in progress: https://dsherret.github.io/ts-simple-ast/

## Getting Started

1. [Installing](https://dsherret.github.io/ts-simple-ast/)
2. [Instantiating](https://dsherret.github.io/ts-simple-ast/setup/)
3. [Adding source files](https://dsherret.github.io/ts-simple-ast/setup/adding-source-files)
4. [Getting source files](https://dsherret.github.io/ts-simple-ast/navigation/getting-source-files)
5. [Navigating](https://dsherret.github.io/ts-simple-ast/navigation/example)
6. [Manipulating](https://dsherret.github.io/ts-simple-ast/manipulation/)

## Example

```ts
import Project from "ts-simple-ast";

// initialize
const project = new Project();

// add source files
project.addExistingSourceFiles("src/**/*.ts");
const myClassFile = project.createSourceFile("src/MyClass.ts", "export class MyClass {}");
const myEnumFile = project.createSourceFile("src/MyEnum.ts", {
    enums: [{
        name: "MyEnum",
        isExported: true,
        members: [{ name: "member" }]
    }]
});

// get information from ast
const myClass = myClassFile.getClassOrThrow("MyClass");
myClass.getName();          // returns: "MyClass"
myClass.hasExportKeyword(); // returns: true
myClass.isDefaultExport();  // returns: false

// manipulate ast
const myInterface = myClassFile.addInterface({
    name: "IMyInterface",
    isExported: true,
    properties: [{
        name: "myProp",
        type: "number"
    }]
});

myClass.rename("NewName");
myClass.addImplements(myInterface.getName());
myClass.addProperty({
    name: "myProp",
    initializer: "5"
});

project.getSourceFileOrThrow("src/ExistingFile.ts").delete();

// asynchronously save all the changes above
project.save();

// get underlying compiler node from the typescript AST from any node
const compilerNode = myClassFile.compilerNode;
```

Or navigate existing compiler nodes created with the TypeScript compiler (the `ts` named export is the TypeScript compiler):

```ts ignore-error: 1109
import {createWrappedNode, ClassDeclaration, ts} from "ts-simple-ast";

// some code that creates a class declaration using the ts object
const classNode: ts.ClassDeclaration = ...; 

// create and use a wrapped node
const classDec = createWrappedNode(classNode) as ClassDeclaration;
const firstProperty = classDec.getProperties()[0];

// ... do more stuff here ...
```

## Resources

* [AST Viewers](https://dsherret.github.io/ts-simple-ast/setup/ast-viewers)
