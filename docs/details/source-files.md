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

### Save to file system

You can save a source file to the file system using one of the following commands:

```typescript
sourceFile.save(err => {}); // callback is optional
sourceFile.saveSync();
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
