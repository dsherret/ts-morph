---
title: Setup
---

# Setup

## Importing and Instantiating

Use the default export from `"ts-simple-ast"`:

```typescript
import Ast from "ts-simple-ast";

const ast = new Ast();
```

### Custom compiler options

```typescript
import * as ts from "typescript";

const ast = new Ast({
    compilerOptions: {
        target: ts.ScriptTarget.ES3
    }
});
```

### Custom tsconfig.json

By default, if a *tsconfig.json* is found in the current working directory then it will use that file for the *tsconfig.json*.

If you would like to manually specify the path to a *tsconfig.json* file then specify that:

```typescript
const ast = new Ast({
    tsConfigFilePath: "path/to/tsconfig.json"
});
```

## Adding Source Files

You will need to populate the `ast` object with source files.

### By file globs or file paths

Specify as many file globs or file paths as you wish:

```typescript
ast.addSourceFiles("folder/**/*.ts", "otherFolder/file.ts");
```

### By file path

```typescript
const sourceFile = ast.getOrAddSourceFileFromFilePath("path/to/file.ts");
```

### By string

Adding source files by text to the AST will act like any other file that exists on the file system, but they will not be saved to the disk unless you ask it to be.

```typescript
const fileText = "enum MyEnum {\n}\n";
const sourceFile = ast.addSourceFileFromText("path/for/myNewFile.ts", fileText);

// save it to the disk if you wish:
sourceFile.save(); // or saveSync();
```

## Next Step

* [Navigating the AST](../navigation/index)
