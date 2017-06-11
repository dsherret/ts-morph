---
title: Adding Source Files
---

## Adding Source Files

You will need to populate the `ast` object with source files.

### By file globs or file paths

Specify as many file globs or file paths as you wish:

```typescript
ast.addSourceFiles("folder/**/*{.d.ts,.ts}");
ast.addSourceFiles("otherFolder/file.ts", "specifyAnotherFile.ts", "orAnotherGlob/**/*.ts");
```

### By file path

```typescript
const sourceFile = ast.getOrAddSourceFileFromFilePath("path/to/file.ts");
```

### By structure

You can create source files based on a structure:

```typescript
const sourceFile = ast.addSourceFileFromStructure("path/to/MyFile.ts", {
    enums: [{
        name: "MyEnum",
        members: [{
            name: "member"
        }]
    }],
    classes: [{
        name: "MyClass",
        // etc...
    }]
    // etc...
});
```

The above would create a source file with the following text:

```typescript
enum MyEnum {
    member
}

class MyClass {
}
```

### By string

Adding source files by text to the AST will act like any other file that exists on the file system, but they will not be saved to the disk unless you ask it to be.

```typescript
const fileText = "enum MyEnum {\n}\n";
const sourceFile = ast.addSourceFileFromText("path/to/myNewFile.ts", fileText);

// save it to the disk if you wish:
sourceFile.save(); // or saveSync();
```

**Next step:** [Diagnostics](diagnostics)
