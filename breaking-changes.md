# Breaking Changes

View [CHANGELOG.md](CHANGELOG.md) for more detail on releases. This file is only a high level overview of breaking changes.

## Version 13

* `CompilerApiNodeBrandPropertyNamesType` is now `CompilerNodeBrandPropertyNamesType`.
* `renameName` on `ImportSpecifier` and `ExportSpecifier` is now deprecated. Use `importSpecifier.getNameNode().rename(newName)`.
* Renamed `getAliasIdentifier()` to `getAliasNode()` on `ImportSpecifier` and `ExportSpecifier`. Done for consistency.
* Deprecated `node.getStartColumn()` and `node.getEndColumn()`.
* Renamed `sourceFile.getColumnAtPos(pos)` to `.getLengthFromLineStartAtPos(pos)` for correctness.
* Renamed `sourceFile.getLineNumberFromPos(pos)` to `getLineNumberAtPos(pos)` for consistency.
* `getImplementations()[i].getNode()` now returns the identifier range (compiler API changed behaviour).

### `FunctionDeclaration` has an optional name

Similarly to `ClassDeclaration`, `FunctionDeclaration` can have an optional name when used as a default export:

```ts
export default function() {
}
```

To support this scenario, `FunctionDeclaration`'s name has become optional.

### `forEachDescendant` improvement

Previously, stopping traveral in `node.forEachDescendant(...)` was done like the following:

```ts
node.forEachDescendant((node, stop) => {
    if (node.getKind() === SyntaxKind.FunctionDeclaration)
        stop();
});
```

The new code is the following:

```ts
node.forEachDescendant((node, traversal) => {
    if (node.getKind() === SyntaxKind.FunctionDeclaration)
        traversal.stop();
});
```

This is to allow for more advanced scenarios:

```ts
node.forEachDescendant((node, traversal) => {
    switch (node.getKind()) {
        case SyntaxKind.ClassDeclaration:
            // skips traversal of the current node's descendants
            traversal.skip();
            break;
        case SyntaxKind.ParameterDeclaration:
            // skips traversal of the current node, siblings, and all their descendants
            traversal.up();
            break;
        case SyntaxKind.FunctionDeclaration:
            // stop traversal completely
            traversal.stop();
            break;
    }
});
```

Also, take note that `node.forEachChild` has been updated for consistency with `forEachDescendant`:

```ts
node.forEachChild((node, traversal) => {
    if (node.getKind() === SyntaxKind.FunctionDeclaration)
        traversal.stop();
});
```

## Version 12

### Conditional Types

The declaration file now uses some conditional types and that requires TypeScript 2.8+.

### Type Methods

Methods in the form of `Type.isXType()` are now `Type.isX()`. For example:

```ts
type.isArrayType();
```

Is now:

```ts
type.isArray();
```

This was done so it aligns with the TypeScript compiler API methods and to remove the needless repetition in the naming.

### Renamed Methods

* `getReferencingNodes()` on `ReferenceFindableNode`s is now `findReferencesAsNodes()` and `languageService.getDefinitionReferencingNodes()` is also now `findReferencesAsNodes()`. This was done to improve its discoverability.


## Version 11

### CodeBlockWriter is now a named export

Instead of access code-block-writer by doing:

```ts
import CodeBlockWriter from "code-block-writer";
```

It's now a named export from this library:

```ts
import { CodeBlockWriter } from "ts-simple-ast";
```

### New `FileSystemHost` Methods

The `FileSystemHost` interface now has `move`, `moveSync`, `copy`, and `copySync` methods.

### Changed methods/properties

`Directory`
* `.remove()` is now `.forget()` - This was done for consistency with `SourceFile`.

`SourceFile`
* `getRelativePathToSourceFileAsModuleSpecifier` is now `getRelativePathAsModuleSpecifierTo`.
* `getRelativePathToSourceFile` is now `getRelativePathTo`.

`Identifier`
* `getDefinitionReferencingNodes()` is now `getReferencingNodes()` for consistency.

`ClassDeclarationStructure`
* `ctor` is now `ctors` - There can be multiple constructors on ambient classes.

`ExportAssignmentStructure`
* `isEqualsExport` is now `isExportEquals` - I originally named this incorrectly by accident.

## Version 10

### ClassDeclaration's name is now nullable

I had no idea you can have class declarations with no names...

```ts
export default class {
    // ...etc...
}
```

...and so `.getName()` and `.getNameNode()` on `ClassDeclaration` is now nullable. I recommend using `.getNameOrThrow()` if you don't want to check for null each time or assert null.

### Changed methods

`Project` and `Directory`
* `addSourceFileIfExists` is now `addExistingSourceFileIfExists` (standardizes with `addExistingSourceFile`)
* `addDirectoryIfExists` is now `addExistingDirectoryIfExists` (standardizes with `addExistingDirectory`)

`SourceFile`
* `getReferencingImportAndExportDeclarations` is removed. Use `getReferencingNodesInOtherSourceFiles`.

### VariableDeclarationType/QuoteType -> VariableDeclarationKind/QuoteKind

`VariableDeclarationType` and `QuoteType` are now called `VariableDeclarationKind` and `QuoteKind` respectively.

This was done to reduce the confusion with the word "type" and to standardize it with other enums.

### Script Target

Script target was removed from the manipulation settings (it was there for legacy reasons) and can now be found only on the compiler options.

### Imports Formatting

Instead of being written as:

```ts
import {SomeExport} from "./SomeFile";
```

Imports will now be written with spaces (as is the default in the compiler):

```ts
import { SomeExport } from "./SomeFile";
```

If you don't want this behaviour, then set the `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces` to `false` in the [manipulation settings](https://dsherret.github.io/ts-simple-ast/manipulation/settings).

### Upgrade to TypeScript 2.8

The library has been upgraded to TypeScript 2.8.

To celebrate there is a new `sourceFile.organizeImports()` method. It takes a long time
to run it on an entire code base though... (depends how big your project is, of course). At least it's still faster than a human :)

### "Base" declarations removed from declaration file

There were some "Base" declarations (ex. `ClassDeclarationBase`) variables that were previously exported
from the library. It was previously necessary to export these because the TypeScript compiler would complain
about them needing to be public, but I manged to get around this by writing a script that modifies the declaration file to hide them after the fact.

### Directories

The library is smarter about populating directories. See [#285](issues/285), [#286](issues/286), [#287](issues/287) for more details.

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
