ts-simple-ast
=============

[![Build Status](https://travis-ci.org/dsherret/ts-simple-ast.svg)](https://travis-ci.org/dsherret/ts-simple-ast)
[![Coverage Status](https://coveralls.io/repos/dsherret/ts-simple-ast/badge.svg?branch=master&service=github)](https://coveralls.io/github/dsherret/ts-simple-ast?branch=master)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

TypeScript compiler wrapper. Provides a simple way to navigate and manipulate the TypeScript AST.

DON'T USE THIS YET! This is a prototype and there's still a lot more work that needs to go into this. So far I barely have anything, but I will be working on this a lot over the next few months.
I believe it will replace [ts-type-info](https://github.com/dsherret/ts-type-info) eventually as this is much more powerful.

## Simple Layer

*ts-simple-ast* adds an abstraction layer over the compiler while still providing access to the underlying TypeScript compiler AST.

1. Simple Layer - Provides a simple way for navigating and manipulating the AST.
2. Compiler Layer - TypeScript compiler objects.

Changes made in the simple layer will be made to the underlying compiler layer.


## Example

```typescript
const ast = new TsSimpleAst();
const sourceFile = ast.addSourceFileFromText("MyFile.ts", "enum MyEnum {}\nlet myEnum: MyEnum;\nexport default MyEnum;");
const enumDeclaration = sourceFile.getEnumDeclarations()[0];
enumDeclaration.getName(); // "MyEnum"
enumDeclaration.setName("NewName");
enumDeclaration.addMember({
    name: "myNewMember"
});
enumDeclaration.setIsDefaultExport(false);
sourceFile.getFullText(); // "enum NewName {\n    myNewMember\n}\nlet myEnum: NewName;"
const sourceFileNode = sourceFile.getCompilerNode(); // underlying compiler node from the typescript AST
```
