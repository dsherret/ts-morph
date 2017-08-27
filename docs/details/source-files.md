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

You can save a source file to the file system using one of the following commands:

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

You can copy a source file to a new file by specifying a new relative or absolute path:

```typescript
const newSourceFile = sourceFile.copy("newFileName.ts");
```

Note that the file won't be written to the file system unless you save it.

### Move

TODO: Not yet supported.

### Remove

You can remove a source file from the AST by calling:

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

Get:

```typescript
const imports = sourceFile.getImports();
```

Add or insert use `insertImport`, `insertImports`, `addImport`, or `addImports`:

```typescript
const importDeclaration = sourceFile.addImport({
    defaultImport: "MyClass",
    moduleSpecifier: "./file"
});
```

Read more about [Import Declarations](imports).

### Export Declarations

Get:

```typescript
const exports = sourceFile.getExports();
```

Add or insert use `insertExport`, `insertExports`, `addExport`, or `addExports`:

```typescript
const importDeclaration = sourceFile.addExport({
    defaultImport: "MyClass",
    moduleSpecifier: "./file"
});
```

Read more about [Export Declarations](exports).

### Formatting Text

Sometimes you might encounter code that looks terrible. For example:

```typescript
// BadlyFormattedFile.ts
var myVariable     :      string |    number;
function myFunction(param    : MyClass){
return "";
}
```

You can automatically format the text of this file by calling format text on it:

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
**WARNING:** If you use this method, all previously navigated descendants in the source file will be disposed because the TypeScript
compiler could possibly shift nodes around (an exception will be thrown if you try to use them).

This shouldn't be an issue because usually this method will be called first or right before saving.
</aside>
