---
title: Adding Source Files
---

## Adding Source Files

You will need to populate the `ast` object with source files.

### By file globs or file paths

Specify as many file globs or file paths as you wish:

```typescript
ast.addSourceFiles("folder/**/*.ts", "otherFolder/file.ts");
```

### By file path

```typescript
const sourceFile = ast.getOrAddSourceFileFromFilePath("path/to/file.ts");
```

### By string

Adding source files by text to the AST will act like any other file that exists on the file system, but they will not be saved to the disk unless you ask it to be.

```typescript
const fileText = "enum MyEnum {\n}\n";
const sourceFile = ast.addSourceFileFromText("path/for/myNewFile.ts", fileText);

// save it to the disk if you wish:
sourceFile.save(); // or saveSync();
```

**Next step:** [Navigating the AST](../navigation/index)
