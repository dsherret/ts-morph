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
