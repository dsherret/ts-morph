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

### Get referenced files

This returns any files that are referenced via `/// <reference path="..." />` statements:

```typescript
const referencedFiles = sourceFile.getReferencedFiles();
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

TODO: Not yet supported.

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
