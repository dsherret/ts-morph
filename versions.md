# Version Overview

View [CHANGELOG.md](CHANGELOG.md) for more detail. This file is only a high level overview.

## Version 9

### Improved Wrapping

Improved the wrapping of non-node wrapped compiler objects (symbols, types, diagnostics, etc.). Previously symbols had to be compared like so:

```ts
someSymbol.equals(otherSymbol); // deprecated method
```

But now, as expected, you can compare them using an equality check:

```ts
someSymbol === otherSymbol
```

### ClassDeclaration changes

Class declaration was changed to be more like the compiler. Read [#266](https://github.com/dsherret/ts-simple-ast/issues/266) for more details.

## Version 8

All file system copies, moves, and deletes are now deffered until `.save()` is called on the main `ast` object.

For example:

```ts
import Project from "ts-simple-ast";

const project = new Project();

// ...lots of code here that manipulates, copies, moves, and deletes files...
sourceFile.delete();
directory.delete();
otherSourceFile.move("OtherFile.ts");
otherSourceFile.copy("NewFile.ts");
// ...more code that changes files...

// copies, moves, deletes, and other changes are executed on the file system on this line
project.save();
```

This was done so that nothing will be passed to the file system until you are all done manipulating.

### Deleting, moving, or copying a source file or directory immediately

If you want the previous behaviour, then use the "Immediately" methods:

```ts
await sourceFile.copyImmediately("NewFile.ts"); // or use 'Sync' alternatives
await sourceFile.moveImmediately("NewFile2.ts");
await sourceFile.deleteImmediately();
await directory.deleteImmediately();
```

Moving directories is going to come soon. Follow the progress in [#256](https://github.com/dsherret/ts-simple-ast/issues/256).

## Version 7

The TypeScript peer dependency has been dropped, but there should be no loss of functionality! If there is, please open an issue.

The TypeScript compiler object used by this library can now be accessed via the `ts` named export. Also non-node TypeScript compiler objects used in the public API of this  library are now exported directly as named exports:

```ts
import Project, {ts, SyntaxKind, ScriptTarget} from "ts-simple-ast";
```

### Using the TypeScript compiler and ts-simple-ast

If you were previously using both like so:

```ts
import * as ts from "typescript";
import Project from "ts-simple-ast";

// ... other code

const tsSourceFile = ts.createSourceFile(...etc...);
const classDeclarations = sourceFile.getDescendantsByKind(ts.SyntaxKind.ClassDeclaration);
```

Then you should remove the dependency on the TypeScript compiler and change this code to only use a single import declaration:

```ts
import Project, {SyntaxKind, ts} from "ts-simple-ast";

// ... other code

const tsSourceFile = ts.createSourceFile(...etc...);
const classDeclarations = sourceFile.getDescendantsByKind(SyntaxKind.ClassDeclaration);
```
