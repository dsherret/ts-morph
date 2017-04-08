---
title: Navigating the AST
---

# Navigating the AST

Navigating the AST should be simple and straightforward.

The best way to explore what's implemented is to look at the autocompletion/intellisense results.
If you can't find something that means it's most likely not implemented and you should [open an issue](https://github.com/dsherret/ts-simple-ast/issues) on GitHub.


## Getting Source Files

After source files are added, you will need to get them in order to navigate or make changes.

### All

```typescript
const sourceFiles = ast.getAllSourceFiles();
```

### By file path

Will return the first source file that matches the end of the provided file path:

```typescript
const personFile = ast.getSourceFile("Models/Person.ts");
```

### By condition

Will return the first source file that matches the provided condition:

```typescript
const fileWithFiveClasses = ast.getSourceFile(f => f.getClassDeclarations().length === 5);
```

## Navigating Within Source Files - Example

### Setup

Given the following file:

```typescript
// Person.ts

interface Person {
    name: string;
    age: number;
}

export default Person;
```

And setup:

```typescript
import Ast from "ts-simple-ast";

const ast = new Ast();
ast.addSourceFiles("**/*.ts");
```

### Use

First you need to get the source file you would like to look at:

```typescript
const sourceFile = ast.getSourceFile("Person.ts");
```

Now inspect what's inside... here's a few examples:

```typescript
const hasClasses = sourceFile.getClassDeclarations().length > 0;
const interfaces = sourceFile.getInterfaceDeclarations();

// person interface
const personInterface = sourceFile.getInterfaceDeclaration("Person");
personInterface.isDefaultExport();        // returns true
personInterface.getName();                // returns "Person"
personInterface.getPropertySignatures();  // returns the properties
```

## Underlying Compiler Nodes

Sometimes it might be useful to get the node from the TypeScript compiler.

They're accessible via the `.getCompilerNode()` method that's found on most objects:

```typescript
const compilerNode = personInterface.getCompilerNode();
```

**Warning:** When manipulating the AST via this library, the underlying TypeScript AST tree is regenerated each time. For this reason, it's important not
to hold on to TypeScript compiler nodes between manipulations or you could end up working with out of date information.

## Next Step

* [Manipulating the AST](../manipulation/index)
