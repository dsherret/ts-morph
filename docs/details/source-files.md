---
title: Source Files
---

## Source Files

Source files are the root nodes of the AST.

### File path and name

Use:

```ts
// returns the file path (ex. /home/david/file.ts)
sourceFile.getFilePath();

// returns only the file name (ex. file.ts)
sourceFile.getBaseName();
```

### Check if declaration file

Use:

```ts
sourceFile.isDeclarationFile(); // returns: boolean
```

### Save

Save a source file to the file system using one of the following commands:

```ts
await sourceFile.save();
sourceFile.saveSync();
```

### Unsaved files

There is a `sourceFile.isSaved()` method that will tell you if the file is saved or not, but it might be easier
to call one of the following methods on the main AST object in order to save unsaved source files:

```ts
ast.saveUnsavedSourceFiles(); // returns: Promise
ast.saveUnsavedSourceFilesSync(); // could potentially be very slow if there are a lot of files to save
```

### Delete

Delete a source file from the file system using one of the following commands:

```ts
await sourceFile.delete(); // or deleteSync()
```

### Copy

Copy a source file to a new file by specifying a new relative or absolute path:

```ts
const newSourceFile = sourceFile.copy("newFileName.ts");
// this won't throw if a file exists at the specified path
const otherSourceFile = sourceFile.copy("other.ts", { overwrite: true });
```

Note that the file, in both these cases, won't be written to the file system unless you save it.

### Move

TODO: Not yet supported.

### Refresh from file system

Refresh the source file from the file system:

```ts
import {FileSystemRefreshResult} from "ts-simple-ast";

 // returns: FileSystemRefreshResult (NoChange, Updated, Deleted)
const result = await sourceFile.refreshFromFileSystem(); // or refreshFromFileSystemSync()
```

This is useful when you are using a file system watcher and want to refresh a source file from the file system based on changes.

If the file was _updated_: All the child nodes of the source file will be forgotten and you will have to renavigate the file.
If the file was _deleted_: The source file will be removed and all its nodes forgotten.

### Remove

Remove a source file from the AST by calling:

```ts
ast.removeSourceFile(sourceFile); // returns: boolean (if was removed)
```

Note: This does not delete the file from the file system. To do delete it, call `.delete()`.

### Referenced files

This returns any files that are referenced via `/// <reference path="..." />` statements:

```ts
const referencedFiles = sourceFile.getReferencedFiles();
```

### Type reference directives

This returns any files that are referenced via `/// <reference types="..." />` statements:

```ts
const typeReferenceDirectives = sourceFile.getTypeReferenceDirectives();
```

### Get default export symbol

If it exists, the default export symbol can be retrieved:

```ts
const defaultExportSymbol = sourceFile.getDefaultExportSymbol(); // returns: Symbol | undefined
```

### Remove default export

Use:

```ts
sourceFile.removeDefaultExport();
```

Note: This is safe to call even when there is no default export.


### Import Declarations

See [Import Declarations](imports).

### Export Declarations

See [Export Declarations](exports).

### Indenting / Unindenting

Call the `.indent` or `.unindent` methods.

```ts
sourceFile.indent(5);        // indent line containing position 5
sourceFile.indent([5, 10]);  // indent line or lines within position range [5-10]
sourceFile.indent(10, 3);    // indent line containing position 10, 3 times

sourceFile.unindent(10);     // unindent line containing position 10

sourceFile.indent(10, -1);   // unindent line containing position 10 (specify negative times)
sourceFile.unindent(10, -1); // indent line containing position 10 (specify negative times)
```

This will indent and unindent based on your [manipulation settings](../manipulation/settings).

### Getting Exported Declarations

The exported declarations of a file can be retrieved via `.getExportedDeclarations()`.

For example, given the following setup:

```ts
// main.ts
export * from "./classes";
export {Interface1} from "./interfaces";

class MainClass {}
export default MainClass;

// classes.ts
export * from "./Class1";
export * from "./Class2";

// Class1.ts
export class Class1 {}

// Class2.ts
export class Class2 {}

// interfaces.ts
export interface Interface1 {}
export interface Interface2 {}
```

The following code:

```ts
import Ast, {TypeGuards} from "ts-simple-ast";

const ast = new Ast();
ast.addExistingSourceFiles("**/*.ts");
const mainFile = ast.getSourceFileOrThrow("main.ts");

for (const declaration of mainFile.getExportedDeclarations()) {
    if (TypeGuards.isClassDeclaration(declaration) || TypeGuards.isInterfaceDeclaration(declaration))
        console.log(`Name: ${declaration.getName()}`);
    else
        throw new Error(`Not expected declaration kind: ${declaration.getKindName()}`);
}
```

Outputs the following:

```
Name: MainClass
Name: Class1
Name: Class2
Name: Interface1
```

### Relative File Paths

It might be useful to get the relative path from one source file to another.

```ts
const relativePath = sourceFileFrom.getRelativePathToSourceFile(sourceFileTo);
```

Or to get the module specifier text from one source file to another.

```ts
const moduleSpecifier = sourceFileFrom.getRelativePathToSourceFileAsModuleSpecifier(sourceFileTo);
```
