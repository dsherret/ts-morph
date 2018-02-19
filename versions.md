# Version Overview

View [CHANGELOG.md](CHANGELOG.md) for more detail. This file is only a high level overview.

## Version 8

All file system deletes are now deffered until `.save()` is called on the main `ast` object.

For example:

```ts
import Ast from "ts-simple-ast";

const ast = new Ast();

// ...lots of code here that manipulates, copies, moves, and deletes files...
sourceFile.delete();
directory.delete();
otherSourceFile.move("OtherFile.ts");
otherSourceFile.copy("NewFile.ts");
// ...more code that changes files...

// copies, moves, deletes, and other changes are executed on the file system on this line
ast.save();
```

This was done so that nothing will be passed to the file system until you are all done manipulating.

### Deleting a source file or directory immediately

If you want the previous delete behaviour, then use the `.deleteImmediately()` methods:

```ts
await sourceFile.deleteImmediately();
await directory.deleteImmediately();
```

## Version 7

The TypeScript peer dependency has been dropped, but there should be no loss of functionality! If there is, please open an issue.

The TypeScript compiler object used by this library can now be accessed via the `ts` named export. Also non-node TypeScript compiler objects used in the public API of this  library are now exported directly as named exports:

```ts
import Ast, {ts, SyntaxKind, ScriptTarget} from "ts-simple-ast";
```

### Using the TypeScript compiler and ts-simple-ast

If you were previously using both like so:

```ts
import * as ts from "typescript";
import Ast from "ts-simple-ast";

// ... other code

const tsSourceFile = ts.createSourceFile(...etc...);
const classDeclarations = sourceFile.getDescendantsByKind(ts.SyntaxKind.ClassDeclaration);
```

Then you should remove the dependency on the TypeScript compiler and change this code to only use a single import declaration:

```ts
import Ast, {SyntaxKind, ts} from "ts-simple-ast";

// ... other code

const tsSourceFile = ts.createSourceFile(...etc...);
const classDeclarations = sourceFile.getDescendantsByKind(SyntaxKind.ClassDeclaration);
```
