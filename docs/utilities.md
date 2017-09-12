---
title: Utilities
---

## Utilities

This is an outline of any utilities currently available in the library.

### Get compiler options from tsconfig.json

Get the compiler options from a file by using the `getCompilerOptionsFromTsConfig` function:

```typescript
import {getCompilerOptionsFromTsConfig} from "ts-simple-ast";

const compilerOptions = getCompilerOptionsFromTsConfig("file/path/to/tsconfig.json");
```

### Type Guards

There is a collection of type guard functions that are useful for finding out the type of a Node:

```typescript
import {TypeGuards} from "ts-simple-ast";

// ... some code here that gets a node ...

if (TypeGuards.isClassDeclaration(node)) {
    // node is of type ClassDeclaration in here
}
```