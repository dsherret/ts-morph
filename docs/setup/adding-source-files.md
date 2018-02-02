---
title: Adding Source Files
---

## Adding Source Files

You will need to populate the `ast` object with source files.

### By a *tsconfig.json*

Source files will be added when instantiating with a `tsConfigFilePath`:

```ts
const ast = new Ast({
    tsConfigFilePath: "path/to/tsconfig.json"
});
```

...and this can be disabled by setting `addFilesFromTsConfig: false`.

Alternatively, populate the `ast` object by calling `addSourceFilesFromTsConfig`:

```ts
ast.addSourceFilesFromTsConfig("path/to/tsconfig.json");
```

### By file globs or file paths

Specify as many file globs or file paths as you wish:

```ts
ast.addExistingSourceFiles("folder/**/*{.d.ts,.ts}");
ast.addExistingSourceFiles(["folder/file.ts", "folder/otherFile.ts"]);
ast.addExistingSourceFiles(["**/*.ts", "!**/*.d.ts"]);
```

### By file path

```ts
const sourceFile = ast.addExistingSourceFile("path/to/file.ts"); // or addSourceFileIfExists
```

### By structure

Create source files based on an object that looks like the AST of a source file:

```ts
const sourceFile = ast.createSourceFile("path/to/myStructureFile.ts", {
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

```ts
enum MyEnum {
    member
}

class MyClass {
}
```

Note: The file will not be created and saved to the file system until calling `.save()` on the source file.

### By string

```ts
const fileText = "enum MyEnum {\n}\n";
const sourceFile = ast.createSourceFile("path/to/myNewFile.ts", fileText);
```

Note: The file will not be created and saved to the file system until calling `.save()` on the source file.

### Note

Adding source files to the AST from a structure or text will act like any other source file, but they will not be saved to the disk unless you ask it to be.

```ts
// save it to the disk if you wish:
sourceFile.save(); // or saveSync();
```
