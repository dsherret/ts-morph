---
title: Source Files
---

## Source Files

Source files are the root nodes of the AST.

### Get file path

Use:

```typescript
sourceFile.getFilePath(); // returns: string
```

### Check if declaration file

Use:

```typescript
sourceFile.isDeclarationFile(); // returns: boolean
```

### Save

Save a source file to the file system using one of the following commands:

```typescript
await sourceFile.save();
sourceFile.saveSync();
```

### Unsaved files

There is a `sourceFile.isSaved()` method that will tell you if the file is saved or not, but it might be easier
to call one of the following methods on the main AST object in order to save unsaved source files:

```typescript
ast.saveUnsavedSourceFiles(); // returns: Promise
ast.saveUnsavedSourceFilesSync(); // could potentially be very slow if there are a lot of files to save
```

### Delete

Delete a source file from the file system using one of the following commands:

```typescript
await sourceFile.delete(); // or deleteSync()
```

### Copy

Copy a source file to a new file by specifying a new relative or absolute path:

```typescript
const newSourceFile = sourceFile.copy("newFileName.ts");
```

Note that the file won't be written to the file system unless you save it.

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

```typescript
ast.removeSourceFile(sourceFile); // returns: boolean (if was removed)
```

Note: This does not delete the file from the file system. To do delete it, call `.delete()`.

### Referenced files

This returns any files that are referenced via `/// <reference path="..." />` statements:

```typescript
const referencedFiles = sourceFile.getReferencedFiles();
```

### Type reference directives

This returns any files that are referenced via `/// <reference types="..." />` statements:

```typescript
const typeReferenceDirectives = sourceFile.getTypeReferenceDirectives();
```

### Get default export symbol

If it exists, the default export symbol can be retrieved:

```typescript
const defaultExportSymbol = sourceFile.getDefaultExportSymbol(); // returns: Symbol | undefined
```

### Remove default export

Use:

```typescript
sourceFile.removeDefaultExport();
```

Note: This is safe to call even when there is no default export.


### Import Declarations

See [Import Declarations](imports).

### Export Declarations

See [Export Declarations](exports).

### Indenting / Unindenting

Call the `.indent` or `.unindent` methods.

```typescript
sourceFile.indent(5);        // indent line containing position 5
sourceFile.indent([5, 10]);  // indent line or lines within position range [5-10]
sourceFile.indent(10, 3);    // indent line containing position 10, 3 times

sourceFile.unindent(10);     // unindent line containing position 10

sourceFile.indent(10, -1);   // unindent line containing position 10 (specify negative times)
sourceFile.unindent(10, -1); // indent line containing position 10 (specify negative times)
```

This will indent and unindent based on your [manipulation settings](../manipulation/settings).

### Formatting Text

Sometimes you might encounter code that looks terrible. For example:

```typescript
// BadlyFormattedFile.ts
var myVariable     :      string |    number;
function myFunction(param    : MyClass){
return "";
}
```

Automatically format the text of this file by calling format text on it:

```typescript
sourceFile.formatText();
// or provide optional formatting settings
sourceFile.formatText({
    placeOpenBraceOnNewLineForFunctions: true
});
```

This will run the source file's text through the TypeScript compiler's formatting API, which will change the source file to contain the following text:

```typescript
// BadlyFormattedFile.ts (not anymore!)
var myVariable: string | number;
function myFunction(param: MyClass) {
    return "";
}
```
