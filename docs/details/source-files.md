---
title: Source Files
---

## Source Files

Source files are the root nodes of the AST. They can be created or added to a `Project` instance
by following the instructions at [Adding Source Files](../setup/adding-source-files).

### File path and name

Use:

```ts
// returns the file path (ex. /home/david/file.ts)
sourceFile.getFilePath();

// returns only the file name (ex. file.ts)
sourceFile.getBaseName();
```

### Other Information

Check if it's a declaration file:

```ts
sourceFile.isDeclarationFile(); // returns: boolean
```

Check if it was discovered from an external module:

```ts
sourceFile.isFromExternalLibrary();
```

Check if it's a descendant of a `node_modules` directory:

```ts
sourceFile.isInNodeModules();
```

### Save

Save a source file to the file system using one of the following commands:

```ts
await sourceFile.save();
sourceFile.saveSync();
```

Note: This does not emit the files (see [Emitting](../emitting.md)).

### Unsaved files

Use the `sourceFile.isSaved()` method that will tell you if the file is saved to the file system.

### Delete

The `sourceFile.delete()` method will queue up deletions to the file system. When done call `project.save()`. For example:

```ts
import { Project } from "ts-morph";

// queue up all the source files to be deleted
const project = new Project();
project.addSourceFilesAtPaths("folder/**/*.ts")

project.getSourceFileOrThrow("someFile.ts").delete();
project.getSourceFileOrThrow("someOtherFile.ts").delete();

// after you're all done, finally save your changes to the file system
project.save();
```

#### Deleting Immediately

It's possible to delete a source file from the file system immediately by calling one of the following methods:

```ts
await sourceFile.deleteImmediately();
sourceFile.deleteImmediatelySync();
```

This isn't recommended though because it could possibly leave the file system in a halfway state if your code errors before it's done.

### Copy

Copy a source file to a new file by specifying a new relative or absolute path:

```ts setup: const someDirectoryObject: Directory
const newSourceFile = sourceFile.copy("newFileName.ts");
// this won't throw if a file exists at the specified path
const otherSourceFile = sourceFile.copy("other.ts", { overwrite: true });
// or specify directory to copy to
sourceFile.copyToDirectory("/some/dir");
sourceFile.copyToDirectory(someDirectoryObject);
```

Note: If necessary, this will automatically update the module specifiers of the relative import and export declarations
in the copied file.

#### Copying Immediately

As with `.deleteImmediately()` it's possible to immediately copy a file and have the changes reflected on the file system:

```ts
await sourceFile.copyImmediately("NewFile.ts");
sourceFile.copyImmediatelySync("NewFile2.ts");
```

### Move

Moves a source file to a new file by specifying a new relative or absolute path:

```ts setup: const someDirectoryObject: Directory
sourceFile.move("newFileName.ts");
// this won't throw if a file exists at the specified path
sourceFile.move("other.ts", { overwrite: true });
// or specify directory to move to
sourceFile.moveToDirectory("/some/dir");
sourceFile.moveToDirectory(someDirectoryObject);
```

Note: If necessary, this will automatically update the module specifiers of the relative import and export declarations
in the moving file and the relative import and export declarations in other files to point to the new location.

#### Moving Immediately

As with `.deleteImmediately()` it's possible to immediately move a file and have the changes reflected on the file system:

```ts
await sourceFile.moveImmediately("NewFile.ts");
sourceFile.moveImmediatelySync("NewFile2.ts");
```

### Refresh from file system

Refresh the source file from the file system:

```ts
import { FileSystemRefreshResult } from "ts-morph";

 // returns: FileSystemRefreshResult (NoChange, Updated, Deleted)
const result = await sourceFile.refreshFromFileSystem(); // or refreshFromFileSystemSync()
```

This is useful when you are using a file system watcher and want to refresh a source file from the file system based on changes.

If the file was _updated_: All the child nodes of the source file will be forgotten and you will have to renavigate the file.
If the file was _deleted_: The source file will be removed and all its nodes forgotten.

### Remove

Remove a source file from the project by calling:

```ts
sourceFile.forget();
```

Or alternatively:

```ts
project.removeSourceFile(sourceFile); // returns: boolean (true if was removed)
```

Note: This does not delete the file from the file system. To do delete it, call `#delete()`.

### Reference comments

```ts
// gets `/// <reference path="..." />` comments
const pathReferenceDirectives = sourceFile.getPathReferenceDirectives();
// gets `/// <reference types="..." />` comments
const typeReferenceDirectives = sourceFile.getTypeReferenceDirectives();
// gets `/// <reference lib="..." />` comments
const libReferenceDirectives = sourceFile.getLibReferenceDirectives();
```

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

### Getting referencing files

Getting the source files that reference this source file in nodes like import declarations, export declarations, import equals declarations, and dynamic imports can be found by using the following:

```ts
const referencingSourceFiles = sourceFile.getReferencingSourceFiles();
```

To get the nodes that reference the source file in other source files:

```ts
const referencingNodes = sourceFile.getReferencingNodesInOtherSourceFiles();
```

To get the string literals that reference this source file in other source files:

```ts
const referencingLiterals = sourceFile.getReferencingLiteralsInOtherSourceFiles();
```

### Getting referenced files

The opposite of the referencing files, is the referenced files—files that are referenced in nodes within the current file.

```ts
const referencedSourceFiles = sourceFile.getReferencedSourceFiles();
```

To get the nodes that reference other source files:

```ts
const nodesReferencingOtherSourceFiles = sourceFile.getNodesReferencingOtherSourceFiles();
```

To get the string literals that reference other source files:

```ts
const literalsReferencingOtherSourceFiles = sourceFile.getLiteralsReferencingOtherSourceFiles();
// or to get all the literals that reference a module (and may not have been resolved to a source file)
const importLiterals = sourceFile.getImportStringLiterals();
```

### Relative File Paths

It might be useful to get the relative path from one source file to another source file or directory.

```ts setup: let sourceFileFrom: SourceFile, sourceFileTo: SourceFile;
const relativePath = sourceFileFrom.getRelativePathTo(sourceFileTo);
```

Or to get the module specifier text from one source file to another source file or directory.

```ts setup: let sourceFileFrom: SourceFile, sourceFileTo: SourceFile;
const moduleSpecifier = sourceFileFrom.getRelativePathAsModuleSpecifierTo(sourceFileTo);
```

## Source File Code Fixes

### Organizing Imports

It's possible to organize all the imports in a source file via the ["organize imports"](https://blogs.msdn.microsoft.com/typescript/2018/03/27/announcing-typescript-2-8/)
feature from TypeScript 2.8.

```ts
sourceFile.organizeImports();
```

Note: This will forget all the previously navigated nodes so it's recommended to make this either the first or last action you do to a source file.

### Add Missing Imports

To add all the missing import declarations to a source file, use the following method:

```ts
sourceFile.fixMissingImports();
```

### Fix Unused Identifiers

To remove all unused declarations (ex. variables, classes, etc..) from a source file, use the following method:

```ts
sourceFile.fixUnusedIdentifiers();
```

Tip: For optimal results, sometimes this method needs to be called more than once. There could be nodes that are only referenced in unused declarations and in this case another call would remove them.

Note: This will forget all the previously navigated nodes so it's recommended to make this either the first or last action you do to a source file.
