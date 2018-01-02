---
title: File System
---

## File System

By default, the library will use the local file system based on the current working directory. In most scenarios, you won't have to bother with what's outlined here, but it may
by useful in some scenarios (for example, using a virtual file system is useful for mocking the file system for testing purposes).

### Current File System Object

```ts
const fs = ast.getFileSystem(); // returns: FileSystemHost
```

This file system object can be used to interact with the current file system. The methods available on it are very obvious and not worth explaining
here (ex. `writeFile(filePath: string, fileText: string): Promise<void>`, `readFile(filePath: string): Promise<string>`, `readFileSync(filePath: string): string`, etc..).

### Virtual File System

If you want to use a virtual file system that is stored in memory, specify that when creating an `Ast` object:

```ts
import Ast from "ts-simple-ast";

const ast = new Ast({ useVirtualFileSystem: true });
const fs = ast.getFileSystem();

// note that it's ok to use synchronous commands when using a virtual file system
const sourceFile = ast.createSourceFile("file.ts", "console.log(5);");
sourceFile.saveSync();
fs.readFileSync("file.ts"); // returns: "console.log(5);"
```

The current working directory on this file system will be `/`.

#### `lib.d.ts` files

By default, the virtual file system won't have the [`lib.d.ts` files](https://github.com/Microsoft/TypeScript/tree/master/lib). These files may be important because without them,
you won't be able to resolve the types they define.

If you need this information, you will have to write them to the virtual file system manually using a method that works well in your environment:

```ts
import Ast, {FileSystemHost} from "ts-simple-ast";

function loadDtsFiles(fs: FileSystemHost) {
    // Example that loads every single lib file. You most likely don't need all of these.
    // Please consult your version of the compiler to see what's necessary.
    const libDtsFileNames = ["lib.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts", "lib.es2015.collection.d.ts",
        "lib.es2015.core.d.ts", "lib.es2015.d.ts", "lib.es2015.generator.d.ts", "lib.es2015.iterable.d.ts",
        "lib.es2015.promise.d.ts", "lib.es2015.proxy.d.ts", "lib.es2015.reflect.d.ts", "lib.es2015.symbol.d.ts",
        "lib.es2015.symbol.wellknown.d.ts", "lib.es2016.array.include.d.ts", "lib.es2016.d.ts", "lib.es2016.full.d.ts",
        "lib.es2017.d.ts", "lib.es2017.full.d.ts", "lib.es2017.intl.d.ts", "lib.es2017.object.d.ts",
        "lib.es2017.sharedmemory.d.ts", "lib.es2017.string.d.ts", "lib.es2017.typedarrays.d.ts", "lib.es2018.d.ts",
        "lib.es2018.full.d.ts", "lib.es5.d.ts", "lib.es6.d.ts", "lib.esnext.asynciterable.d.ts", "lib.esnext.d.ts",
        "lib.esnext.full.d.ts", "lib.scripthost.d.ts", "lib.webworker.d.ts"];

    for (const fileName of libDtsFileNames) {
        const fileText = ...; // get the file text somehow
        fs.writeFileSync(`node_modules/typescript/lib/${fileName}`, fileText);
    }
}

const ast = new Ast({ useVirtualFileSystem: true });
const fs = ast.getFileSystem();

loadDtsFiles(fs);
```

When using a non-default file system, the library will search for these files in `path.join(fs.getCurrentDirectory(), "node_modules/typescript/lib"))`.

### Custom File System

It's possible to use your own custom file system by implementing the `FileSystemHost` interface then passing in an instance of this when creating a new `Ast` object:

```ts
const Ast, {FileSystemHost} from "ts-simple-ast";

class MyCustomFileSystem implements FileSystemHost {
    // implement it
}

const fs = new MyCustomFileSystem();
const ast = new Ast({}, fs);
```
