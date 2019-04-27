ts-morph
========

[![npm version](https://badge.fury.io/js/ts-morph.svg)](https://badge.fury.io/js/ts-morph)
[![Build Status](https://travis-ci.org/dsherret/ts-morph.svg?branch=master)](https://travis-ci.org/dsherret/ts-morph)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-morph/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-morph?branch=master)
[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[TypeScript](https://github.com/Microsoft/TypeScript) Compiler API wrapper. Provides an easier way to navigate and manipulate TypeScript and JavaScript code.

Formerly `ts-simple-ast`.

## Library Development - Progress Update (20 April 2019)

There were a lot of breaking changes in v2.0. Please review [breaking-changes.md](breaking-changes.md) and see the [changelog](CHANGELOG.md) for information on new features.

This library is still under early active development. Most common code manipulation/generation use cases are implemented, but there's still a lot of work to do.

Please open an issue if you find a feature missing or bug that isn't in the issue tracker.

### Report

View a generated report on what nodes have been wrapped in the [wrapped-nodes.md](wrapped-nodes.md) file.

## Documentation

Work in progress: https://dsherret.github.io/ts-morph/

## Getting Started

1. [Installing](https://dsherret.github.io/ts-morph/)
2. [Instantiating](https://dsherret.github.io/ts-morph/setup/)
3. [Adding source files](https://dsherret.github.io/ts-morph/setup/adding-source-files)
4. [Getting source files](https://dsherret.github.io/ts-morph/navigation/getting-source-files)
5. [Navigating](https://dsherret.github.io/ts-morph/navigation/example)
6. [Manipulating](https://dsherret.github.io/ts-morph/manipulation/)

## Example

```ts
import { Project, StructureKind } from "ts-morph";

// initialize
const project = new Project({
    // Optionally specify compiler options, tsconfig.json, virtual file system, and more here.
    // If you initialize with a tsconfig.json, then it will automatically populate the project
    // with the associated source files.
    // Read more: https://dsherret.github.io/ts-morph/setup/
});

// add source files
project.addExistingSourceFiles("src/**/*.ts");
const myClassFile = project.createSourceFile("src/MyClass.ts", "export class MyClass {}");
const myEnumFile = project.createSourceFile("src/MyEnum.ts", {
    statements: [{
        kind: StructureKind.Enum,
        name: "MyEnum",
        isExported: true,
        members: [{ name: "member" }]
    }]
});

// get information
const myClass = myClassFile.getClassOrThrow("MyClass");
myClass.getName();          // returns: "MyClass"
myClass.hasExportKeyword(); // returns: true
myClass.isDefaultExport();  // returns: false

// manipulate
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
import { createWrappedNode, ClassDeclaration, ts } from "ts-morph";

// some code that creates a class declaration using the ts object
const classNode: ts.ClassDeclaration = ...;

// create and use a wrapped node
const classDec = createWrappedNode(classNode) as ClassDeclaration;
const firstProperty = classDec.getProperties()[0];

// ... do more stuff here ...
```

## Resources

* [AST Viewers](https://dsherret.github.io/ts-morph/setup/ast-viewers)
