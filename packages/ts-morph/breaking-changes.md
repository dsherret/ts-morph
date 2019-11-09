# Breaking Changes

View [CHANGELOG.md](CHANGELOG.md) for more detail on releases. This file is only a high level overview of breaking changes.

## Version 5

* TypeScript 3.7.x support only.
* New `@ts-morph/common` base package. This was done to support `@ts-morph/bootstrap`.
* `TypePredicateNode#getTypeNode()` now possible returns undefined. This was a change done in the compiler api to support the new `asserts` modifier on type predicates.
* Recommended to use the new `Project#addSourceFileAtPath(path)` methods instead of the ones like `Project#addExistingSourceFile(path)`. The old way will be deprecated in Version 6. Special thanks to [@ChristianIvicevic](https://github.com/ChristianIvicevic) for helping out with this one.

## Version 4

Mostly renames:

* `SourceFile#getReferencedFiles()` is now `getPathReferenceDirectives()`. This was done to prevent confusion with upcoming methods in #680. The name was chosen because it is similar to the methods `getTypeReferenceDirectives()` and `getLibReferenceDirectives()`.
* `CodeBlockWriter#indentBlock` is now `indent`. `withHangingIndentation` is now `hangingIndent`. `withHangingIndentationUnlessBlock` is now `hangingIndentUnlessBlock`.
* `DiagnosticMessageChain#getNext()` now returns an array to match TS 3.6.
* `DirectoryEmitResult#getEmitSkipped()` was removed. Check the output file paths and skipped file paths instead as that's more accurate.
* `CompilerExtendedComment` is now called `CompilerCommentNode`.

## Version 3

### `Node#forEachChild` is now aligned with the compiler API

The `Node#forEachChild` method now short circuits when a truthy value is returned from the callback. It will also return this value.

This allows for the following:

```ts
const classDec = sourceFile.forEachChild(node => TypeGuards.isClassDeclaration(node) ? node : undefined);
```

Additionally, the second `control` parameter has been removed. So instead of writing this...

```ts
node.forEachChild((child, control) => {
    if (child.kind === SyntaxKind.PropertyDeclaration)
        child.stop();
    doSomethingWithChild(child);
});
```

...you can just return a truthy value to stop. This now aligns exactly with how the compiler api behaves.

**BUG WARNING!** Previous code that returned a truthy value should be updated to not return one unless the functionality described above is desired.

Read more in issue [#633](https://github.com/dsherret/ts-morph/issues/633).

### `Node#forEachDescendant` is aligned with `forEachChild`'s new behaviour

In addition to what is described in the previous section, the `forEachDescendant` method has also been updated to stop and return on truthy values returned in the callback.

### Renamed some `StructureTypeGuards` static methods

`StructureTypeGuards` was added in version 2. This class unfortunately had some poorly named methods.

In version 3, some `StructureTypeGuards` static methods have removed the word `Node` and `Declaration` in certain cases.

For example the following:

```ts
if (StructureTypeGuards.isExportableNode(structure))
    structure.isExported = false;
```

...is now updated to be...

```ts
if (StructureTypeGuards.isExportable(structure))
    structure.isExported = false;
```

### Renamed `ObjectLiteralElementMemberStructures` to `ObjectLiteralExpressionPropertyStructures`

The `ObjectLiteralElementMemberStructures` alias is now called `ObjectLiteralExpressionPropertyStructures`. This is a more correct name as an object literal expression has "properties" rather than "members" in the compiler api.

### `SourceFile#getTypeReferenceDirectives()` and `#getReferencedFiles()` better reflect the compiler API

These methods used to return source files, but now they return objects similar to what the compiler API returns. There is some loss of functionality here because you will need to resolve the source file reference yourself (previously it wasn't working properly). Please open an issue if you need an easy way to resolve the source file.

### Removed `LanguageService#renameNode` and `#renameLocations`

It wasn't consistent for the language service to have methods that manipulate nodes. These methods are very old from the beginning of the library, but it is better to use `identifier.rename("newName")`.

## Version 2

### Removed default export

For a while now it's been recommended to use the named export instead of the default export for the project. From now on, only the named export can be used:

```ts
import { Project } from "ts-morph";
```

### New `.statements` property on structures with statements / Removed `.bodyText`, `.classes`, `.enums`, etc. properties

Instead of writing code like the following:

```ts
const sourceFileStructure: SourceFileStructure = {
    classes: [{
        name: "MyClass"
    }],
    enums: [{
        name: "MyEnum",
        members: [{ name: "value" }]
    }],
    bodyText: "console.log(5);"
};
```

Write the following:

```ts
const sourceFileStructure: SourceFileStructure = {
    statements: [{
        kind: StructureKind.Class,
        name: "MyClass"
    }, {
        kind: StructureKind.Enum,
        name: "MyEnum",
        members: [{ name: "value" }]
    }, "console.log(5);"]
};
```

This may not be as nice for simple scenarios, but will make the library more flexible and simpler to maintain in the future.

Note the new `.kind` property. This property is necessary in the statements array to differentiate the different structures, but it is not required
when using the specific methods:

```ts
sourceFile.addClass({ name: "MyClass" }); // ok
```

### `.emit()` methods are now async

Methods like `project.emit()` are now async. Corresponding `emitSync` methods have also been added.

The new async emit methods should be much faster than the previous synchronous methods.

### Renamed `Symbol#getXByName`-like methods to `#getX`

The `ByName` suffix was overly verbose, so I removed it. The following methods have been renamed:

* `Symbol#getExportByName(name: string)` -> `getExport`
* `Symbol#getExportByNameOrThrow(name: string)` -> `getExportOrThrow`
* `Symbol#getGlobalExportByName(name: string)` -> `getGlobalExport`
* `Symbol#getGlobalExportByNameOrThrow(name: string)` -> `getGlobalExportOrThrow`
* `Symbol#getMemberByName(name: string)` -> `getMember`
* `Symbol#getMemberByNameOrThrow(name: string)` -> `getMemberOrThrow`

### FileSystemHost changes

The `FileSystemHost` interface now requires implementing `realpathSync()` and `isCaseSensitive()`.

### `JsxText#containsOnlyWhiteSpaces()` renamed to `#containsOnlyTriviaWhiteSpaces()`

This was done to match the change in TS 3.4.

### Removed Structures

These are now all covered by `StatementedNodeStructure`.

* `BodyableNodeStructure`
* `BodiedNodeStructure`
* `ModuledNodeStructure`

### `JsxAttributeStructure` and `JsxSpreadAttributeStructure` differentiation

These two structures are now differentiated based on their new `.kind` property. Previously it used the `isSpreadAttribute` property.

### `JsxElementStructure` and `JsxSelfClosingElementStructure` differentiation

These two structures are now differentiated based on their new `.kind` property. Previously it used the `isSelfClosing` property.

### `ModuledNode#getExportedDeclarations()` now returns a map

Instead of just returning an array of nodes, it now returns a map. The key is the name it was exported on and the value is an array of declarations for that value. This will make it much easier to identify the name a node was exported on.

### Removed `SourceFile#getLineNumberAtPos()`

Removed `SourceFile#getLineNumberAtPos(pos)` in favour of `#getLineAndColumnAtPos(pos)` which returns an object with both line and column number at the provided position:

```ts
const { line, column } = sourceFile.getLineAndColumnAtPos(position);
```

### Removed `Project#applyFileTextChanges()` / Added `FileTextChanges#applyChanges()`

Instead of calling:

```ts
project.applyFileTextChanges(fileTextChanges);
```

Do the following:

```ts
fileTextChanges.forEach(change => change.applyChanges());
```

### Renamed `Type#getArrayType()` to `Type#getArrayElementType()`

This new method name makes more sense:

```ts
const arrayType = ...;
const arrayElementType = arrayType.getArrayType(); // confusing

// better
const arrayElementType = arrayType.getArrayElementType();
```

## `EnumMember#getStructure()` only returns the `initializer`

Previously it would return both the `initializer` and `value`. `value` should be seen as more of a convenience property for setting the initializer.

## Version 1

Renamed library to `ts-morph` and reset version to 1.0.0.

# Archive: ts-simple-ast breaking changes

## Version 21

* `node.getFirstChildByKind` and `node.getChildrenOfKind` now search the parsed tree via `.forEachChild(...)` when specifying a parsed node's syntax kind. Previously it would only search the results of `node.getChildren()`.

### Resolved node_module source files and directories are no longer returned from Project#getSourceFiles() and getDirectories()

Previously resolved source files in `node_modules` would be returned when calling `project.getSourceFiles()`. This was sometimes confusing and meant that people iterating over the source files in a project would need to ensure they weren't looking at the files in the `node_modules` directory.

Now they are not added unless done so explicitly:

```ts
project.addExistingSourceFiles("node_modules/**/*.ts");
```

Note that the directory and source files are still available when you explicitly specify their path (ex. `project.getDirectory("node_modules")`).

## Version 20

* Added support for TS 3.2.
* Removed `JSDocTag#getAtToken()`. The `atToken` property was removed in the compiler api.

## Version 19

* `Options` interface renamed to `ProjectOptions` in order to be more specific.

### Source file dependencies automatically added

Referenced source files in module specifiers and references are now added to the project when constructing a project and providing a tsconfig.

For example, say you had the following files:

```ts
// src/main.ts
export * from "./classes";

// src/classes.ts
export class Test {}

// tsconfig.json
{
    "files": ["src/main.ts"],
    "compilerOptions" {
        // etc...
    }
}
```

Now when constructing a project like so...

```ts
const project = new Project({ tsConfigFilePath: "tsconfig.json" });
```

...the project will now include both source files instead of only *src/main.ts*.

Doing this requires an extra analysis step so if you want to revert back to the old behaviour, provide the `skipFileDependencyResolution` option and set it to true:

```ts
const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    skipFileDependencyResolution: true
});
```

### Project constructor changes

Previously a custom file system host could be passed to the constructor like so:

```ts
const project = new Project({ }, fileSystem);
```

This was mostly for legacy reasons. It's now been moved to be an option.

```ts
const project = new Project({ fileSystem });
```

## Version 18

* `JSDocTag.getName()` is now `.getTagName()`. This was originally incorrectly named and `.getName()` is necessary for js doc tags that have one (such as `JSDocPropertyLikeTag`).

## Version 17

* Removed `CompilerNodeBrandPropertyNamesType` type alias.
* More nodes are being written with hanging indentation when doing a newline.

## Version 16

### Better support for `global` namespace declarations

In ambient declarations, there exists namespace declarations that look like the following:

```ts
global {
    export class Test {}
}
```

The following changes were made:

Deprecated:

* `.setHasNamespaceKeyword`
* `.setHasModuleKeyword`
* `NamespaceDeclarationStructure` - `hasModuleKeyword` and `hasNamespaceKeyword`

Added:

* `enum NamespaceDeclarationKind {
    Namespace = "namespace",
    Module = "module",
    Global = "global"
}`
* `setDeclarationKind(kind: NamespaceDeclarationKind)`
* `getDeclarationKind(): NamespaceDeclarationKind;`
* `NamespaceDeclarationStructure` - `declarationKind: NamespaceDeclarationKind`

### `IndexSignatureDeclaration` - Return type is now nullable

Even though it's a compile error, index signatures may look like the following:

```ts
interface MyInterface {
    [key: string];
}
```

For this reason, the `.getReturnTypeNode()` method on `IndexSignatureDeclaration` may now return undefined.

### The `XExtensionType` type aliases are now internal

Previously there were a lot of `XExtensionType` type aliases that were used internally within the library, but they were
being exported. These are now not exported from the libraries declaration file and made internal. See [#441](issues/441)
for more details.

## Version 15

* `TypeParameterDeclaration` - `getConstraintNode()` and `getDefaultNode()` are now `getConstraint()` and `getDefault()`.
* `JsxTagNamedNode` - `getTagName()` is now `.getTagNameNode()` for consistency.

### Import and Exports - No renaming for .setX methods

Previously, the following methods would rename with the language service:

* `ImportDeclaration.setDefaultImport`
* `ImportSpecifier.setAlias`
* `ExportSpecifier.setAlias`

These no longer rename using the language service. Use the corresponding `renameX` methods instead.

### `.fill` methods are now `.set`

The `.fill` methods are now called `.set` and their behaviour has changed.

#### It replaces instead of adding

Previously calling...

```ts
classDeclaration.fill({
    properties: [{ name: "newProp" }]
});
```

...would add a property. Now with `.set` it will remove all existing properties and replace it with the specified properties.

If you want the `.fill` behaviour, use the `.addX` methods or provide the structures of the nodes by using `.getStructure()` (Ex. `classDeclaration.set({ properties: [...classDeclaration.getParameters().map(p => p.getStructure()), { name: "NewProperty" }] });`)`

#### It doesn't use the language service

Previously, doing `classDeclaration.fill({ name: "NewName" })` would do a rename with the language service. Now with `.set({ name: "NewName" })` it sets the name without renaming.

## Version 14

### Deprecated `project/sourceFile.getDiagnostics()`

Use `project.getPreEmitDiagnostics()` and `sourceFile.getPreEmitDiagnostics()` instead. Read why in [#384](issues/384).

Also, deprecated `program.getPreEmitDiagnostics()`. It didn't make sense for this method to be on `Program`.

### `BindingNamedNode` now correctly possibly returns a `BindingElement`

For example, given the following code:

```ts
const { a, b } = { a: 1, b: 2 };
```

Doing the following will now correctly return a binding element:

```ts
const statement = sourceFile.getVariableStatements()[0];
const declaration = statement.getDeclarations();

const name = declaration.getNameNode();
if (TypeGuards.isBindingElement(name))
    console.log(name.getElements().map(e => e.getName())); // outputs: ["a", "b"]
```

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
import { CodeBlockWriter } from "ts-morph";
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

If you don't want this behaviour, then set the `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces` to `false` in the [manipulation settings](https://ts-morph.com/manipulation/settings).

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

Class declaration was changed to be more like the compiler. Read [#266](https://github.com/dsherret/ts-morph/issues/266) for more details.

## Version 8

All file system copies, moves, and deletes are now deffered until `.save()` is called on the main `ast` object.

For example:

```ts
import Project from "ts-morph";

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

Moving directories is going to come soon. Follow the progress in [#256](https://github.com/dsherret/ts-morph/issues/256).

## Version 7

The TypeScript peer dependency has been dropped, but there should be no loss of functionality! If there is, please open an issue.

The TypeScript compiler object used by this library can now be accessed via the `ts` named export. Also non-node TypeScript compiler objects used in the public API of this  library are now exported directly as named exports:

```ts
import Project, {ts, SyntaxKind, ScriptTarget} from "ts-morph";
```

### Using the TypeScript compiler and ts-morph

If you were previously using both like so:

```ts
import * as ts from "typescript";
import Project from "ts-morph";

// ... other code

const tsSourceFile = ts.createSourceFile(...etc...);
const classDeclarations = sourceFile.getDescendantsByKind(ts.SyntaxKind.ClassDeclaration);
```

Then you should remove the dependency on the TypeScript compiler and change this code to only use a single import declaration:

```ts
import Project, {SyntaxKind, ts} from "ts-morph";

// ... other code

const tsSourceFile = ts.createSourceFile(...etc...);
const classDeclarations = sourceFile.getDescendantsByKind(SyntaxKind.ClassDeclaration);
```
