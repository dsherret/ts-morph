---
title: File System
---

## File System

By default, the library will use the local file system based on the current working directory. In most scenarios, you won't have to bother with what's outlined here, but it may be useful in some scenarios (for example, using an in-memory file system is useful for mocking the file system for testing purposes).

### Current File System Object

```ts
import { Project } from "ts-morph";
const project = new Project();

const fs = project.getFileSystem(); // returns: FileSystemHost
```

This file system object can be used to interact with the current file system. The methods available on it are very obvious and not worth explaining
here (ex. `writeFile(filePath: string, fileText: string): Promise<void>`, `readFile(filePath: string): Promise<string>`, `readFileSync(filePath: string): string`, etc..).

### In-Memory File System

If you want to use a file system that is stored in memory, specify that when creating a `Project` instance:

```ts
import { Project } from "ts-morph";

const project = new Project({ useInMemoryFileSystem: true });
const fs = project.getFileSystem();

const sourceFile = project.createSourceFile("file.ts", "console.log(5);");
sourceFile.saveSync();
console.log(fs.readFileSync("file.ts")); // outputs: "console.log(5);"
```

The current working directory on this file system will be `/`.

This file system can also be imported and created via the `InMemoryFileSystemHost` export.

#### Remember: The Default Script Target is `ES5`

You may wonder why certain standard types are `any` when using an in memory file system:

```ts
const project = new Project({ useInMemoryFileSystem: true });
const sourceFile = project.createSourceFile(
    "index.ts",
    `const mySet = new Set<string>();`,
);
const mySetDecl = sourceFile.getVariableDeclarationOrThrow("mySet");
console.log(mySetDecl.getType().getText()); // any
```

This is because, the `lib` compiler option must be specified, similar to when you use `tsc`:

```ts setup: let mySetDecl: Node;
const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
        lib: ["lib.es2015.d.ts"],
    },
});
/// ...omitted... same as above...
console.log(mySetDecl.getType().getText()); // Set<string>, good
```

Or you may specify a target that will implicitly load in the lib files that you need:

```ts setup: let mySetDecl: Node;
import { Project, ts } from "ts-morph";

const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
        target: ts.ScriptTarget.ES2015,
    },
});
/// ...omitted... same as above...
console.log(mySetDecl.getType().getText()); // Set<string>, good
```

Note that if you want to include all the lib files, you may specify `lib.esnext.full.d.ts` as a `lib` option:

```ts
const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
        lib: ["lib.esnext.full.d.ts"],
    },
});
```

### Custom File System

It's possible to use your own custom file system by implementing the `FileSystemHost` interface then passing in an instance of this when creating a new `Project` instance:

```ts ignore-error: 2420, 2345, 2740
import { Project, FileSystemHost } from "ts-morph";

class MyCustomFileSystem implements FileSystemHost {
    // implement it
}

const fs = new MyCustomFileSystem();
const project = new Project({ fileSystem: fs });
```
