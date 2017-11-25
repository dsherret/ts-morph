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

### Saving

Save a source file to the file system using one of the following commands:

```typescript
sourceFile.save(); // returns: Promise
sourceFile.saveSync();
```

### Unsaved files

There is a `sourceFile.isSaved()` method that will tell you if the file is saved or not, but it might be easier
to call one of the following methods on the main AST object in order to save unsaved source files:

```typescript
ast.saveUnsavedSourceFiles(); // returns: Promise
ast.saveUnsavedSourceFilesSync(); // could potentially be very slow if there are a lot of files to save
```

### Copy

Copy a source file to a new file by specifying a new relative or absolute path:

```typescript
const newSourceFile = sourceFile.copy("newFileName.ts");
```

Note that the file won't be written to the file system unless you save it.

### Move

TODO: Not yet supported.

### Remove

Remove a source file from the AST by calling:

```typescript
ast.removeSourceFile(sourceFile); // returns: boolean (if was removed)
```

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
```

This will run the source file's text through the TypeScript compiler's printer, which will change the source file to contain the following text:

```typescript
// BadlyFormattedFile.ts
var myVariable: string | number;
function myFunction(param: MyClass) {
    return "";
}
```

<aside class="warning">
**WARNING:** If you use this method, all previously navigated descendants in the source file will be forgotten because the TypeScript
compiler could possibly shift nodes around (an exception will be thrown if you try to use them).

This shouldn't be an issue because usually this method will be called first or right before saving.
</aside>
