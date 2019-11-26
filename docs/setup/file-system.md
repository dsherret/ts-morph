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

#### `lib.d.ts` files

Since ts-morph 6.0, the in memory file system will have the [`lib.d.ts` files](https://github.com/Microsoft/TypeScript/tree/master/lib) loaded into the `/node_modules/typescript/lib` folder by default.

If you want the old behaviour, you can specify to skip loading them by providing a `skipLoadingLibFiles` option:

```ts ignore-error: 1109
import { Project, FileSystemHost } from "ts-morph";

const project = new Project({
    inMemoryFileSystem: true,
    skipLoadingLibFiles: true
});

console.log(project.getFileSystem().directoryExistsSync("/node_modules")); // false
```

When using a non-default file system, the library will search for these files in `path.join(fs.getCurrentDirectory(), "node_modules/typescript/lib"))`.

### Custom File System

It's possible to use your own custom file system by implementing the `FileSystemHost` interface then passing in an instance of this when creating a new `Project` instance:

```ts ignore-error: 2420, 2345
import { Project, FileSystemHost } from "ts-morph";

class MyCustomFileSystem implements FileSystemHost {
    // implement it
}

const fs = new MyCustomFileSystem();
const project = new Project({ fileSystem: fs });
```
