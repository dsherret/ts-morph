---
title: Utilities
---

## Utilities

This is an outline of any utilities currently available in the library.

### Get compiler options from tsconfig.json

Get the compiler options from a file by using the `getCompilerOptionsFromTsConfig` function:

```ts
import {getCompilerOptionsFromTsConfig} from "ts-simple-ast";

const result = getCompilerOptionsFromTsConfig("file/path/to/tsconfig.json");

result.options; // compiler options
result.errors;  // diagnostics
```

### Type Guards

There is a collection of type guard functions that are useful for finding out the type of a Node:

```ts
import {TypeGuards} from "ts-simple-ast";

// ... some code here that gets a node ...

if (TypeGuards.isClassDeclaration(node)) {
    // node is of type ClassDeclaration in here
}
```

### Printing a Node

Usually with the library, you can print any node by calling the `.print()` method:

```ts
node.print(); // returns: string
```

But sometimes you might want to print a compiler node. There's a `printNode` utility function for doing that:

```ts
import * as ts from "typescript";
import {printNode} from "ts-simple-ast";

// Source: https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API
const tsFunctionDeclaration = ts.createFunctionDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/[ts.createToken(ts.SyntaxKind.ExportKeyword)],
    /*asteriskToken*/ undefined,
    "myFunction",
    /*typeParameters*/ undefined,
    /*parameters*/ [],
    /*returnType*/ ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    ts.createBlock([ts.createReturn(ts.createLiteral(5))], /*multiline*/ true),
);
// optionally provide a source file and there is some printing options on this
const functionText = printNode(tsFunctionDeclaration);

console.log(functionText);
// outputs:
// ========
// export function myFunction(): number {
//     return 5;
// }
````
