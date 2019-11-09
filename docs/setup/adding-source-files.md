---
title: Adding Source Files
---

## Adding Source Files

You will need to populate the `project` object with source files.

### By a *tsconfig.json*

Source files will be added when instantiating with a `tsConfigFilePath`:

```ts
import { Project } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "path/to/tsconfig.json"
});
```

...and this can be disabled by setting `addFilesFromTsConfig: false`:

```ts
const project = new Project({
    tsConfigFilePath: "path/to/tsconfig.json",
    addFilesFromTsConfig: false
});
```

Alternatively, populate the `project` object by calling `addSourceFilesFromTsConfig`:

```ts
project.addSourceFilesFromTsConfig("path/to/tsconfig.json");
```

#### Source File Dependency Resolution

By default, all the source files added to the project in the constructor via a *tsconfig.json* will automatically be analyzed to
include the source files they depend on. If you wish to skip this analysis step, then provide the `skipFileDependencyResolution` option:

```ts
const project = new Project({
    tsConfigFilePath: "path/to/tsconfig.json",
    skipFileDependencyResolution: true
});
```

If you are adding source files to a project in other ways and want to ensure the all the source files dependended on by the added source files
are also included in the Project, then call the `.resolveSourceFileDependencies()` after adding everything:

```ts
const project = new Project();

// add everything to the project
project.addSourceFilesFromTsConfig("dir1/tsconfig.json");
project.addSourceFilesFromTsConfig("dir2/tsconfig.json");
project.addSourceFilesAtPaths("dir3/**/*{.d.ts,.ts}");

// optionally call this when complete to resolve and
// add the dependent source files to the project
project.resolveSourceFileDependencies();
```

### By file globs or file paths

Specify as many file globs or file paths as you wish:

```ts
project.addSourceFilesAtPaths("folder/**/*{.d.ts,.ts}");
project.addSourceFilesAtPaths(["folder/file.ts", "folder/otherFile.ts"]);
project.addSourceFilesAtPaths(["**/*.ts", "!**/*.d.ts"]);
```

### By file path

```ts
const sourceFile = project.addSourceFileAtPath("path/to/file.ts"); // or addSourceFileAtPathIfExists
```

### By structure

Create source files based on an object that looks like the AST of a source file:

```ts
const sourceFile = project.createSourceFile("path/to/myStructureFile.ts", {
    statements: [{
        kind: StructureKind.Enum,
        name: "MyEnum",
        members: [{
            name: "member"
        }]
    }, {
        kind: StructureKind.Class,
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

### By string

```ts
const fileText = "enum MyEnum {\n}\n";
const sourceFile = project.createSourceFile("path/to/myNewFile.ts", fileText);
```

### By writer function

```ts
const sourceFile = project.createSourceFile("path/to/myOtherNewFile.ts", writer => {
    writer
        .writeLine("import * as ts from 'typescript';").blankLine()
        .writeLine("export class MyClass {}");
});
```

### Options

`createSourceFile` will throw an error if the file already exists.
To not throw an error, set the `overwrite` option to true.

```ts
const sourceFile = project.createSourceFile("path/to/myNewFile.ts", "", { overwrite: true });
```

### Note

Adding source files to the project from a structure, writer function, or text will act like any other source file, but they will not be saved to the disk unless you ask it to be.

```ts
// save it to the disk if you wish:
sourceFile.save(); // or saveSync();
```
