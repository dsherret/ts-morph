ts-simple-ast
=============

[![npm version](https://badge.fury.io/js/ts-simple-ast.svg)](https://badge.fury.io/js/ts-simple-ast)
[![Build Status](https://travis-ci.org/dsherret/ts-simple-ast.svg?branch=master)](https://travis-ci.org/dsherret/ts-simple-ast)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-simple-ast/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-simple-ast?branch=master)
[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

TypeScript compiler wrapper. Provides a simple way to navigate and manipulate TypeScript and JavaScript code.

## Library Development - Progress Update (10 January 2018)

Navigation through statements and expressions is mostly implemented thanks to [@dicarlo2](https://github.com/dicarlo2)! I'm going to soon use this library to identify and make a list of missing navigation features, but it shouldn't be too much at this point (see [#93](https://github.com/dsherret/ts-simple-ast/issues/93)).

Most common code manipulation/generation use cases are implemented, but there's still a lot of work to do.

Please open an issue if find a feature missing or bug that isn't in the issue tracker.


## Documentation

Work in progress: https://dsherret.github.io/ts-simple-ast/

## Example

```typescript
import Ast from "ts-simple-ast";

// add source files to ast
const ast = new Ast();
const sourceFile = ast.createSourceFile("MyFile.ts", "enum MyEnum {}\nlet myEnum: MyEnum;\nexport default MyEnum;");
ast.addExistingSourceFiles("folder/**/*{.d.ts,.ts}");
ast.createSourceFile("misc.ts", {
    classes: [{
        name: "SomeClass",
        isExported: true
    }],
    enums: [{
        name: "SomeEnum",
        isExported: true,
        members: [{ name: "member" }]
    }]
});

// get information from ast
const enumDeclaration = sourceFile.getEnumOrThrow("MyEnum");
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
const sourceFileCompilerNode = sourceFile.compilerNode;
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

## Resources

* [AST Viewers](https://dsherret.github.io/ts-simple-ast/setup/ast-viewers)
