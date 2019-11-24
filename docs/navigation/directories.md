---
title: Directories
---

## Directories

Based on the source files created, appropriate directory objects will be created. These objects hold source files and directories that have been added.

Note that it's completely fine to ignore the concept of directories and only deal with source files. This is an advanced feature that
only needs to be used if it will help make solving your problem easier.

### Retrieving

Directories can be retrieved from a source file:

```ts
const directory = sourceFile.getDirectory();
```

From other directories:

```ts
directory.getDirectory("childDir");
directory.getDirectoryOrThrow("childDir");
// child directories
directory.getDirectories();
// parent directory, if it exists
directory.getParent();
```

Or from the main `project` object:

```ts
project.getRootDirectories(); // gets directories without a parent
project.getDirectories(); // gets all the directories
project.getDirectory("path/to/directory");
project.getDirectoryOrThrow("path/to/directory");
```

### Adding

On a directory:

```ts
const childDirectory = directory.addDirectoryAtPath("childDir"); // or addDirectoryAtPathIfExists
```

Or main `project` object:

```ts
const directory = project.addDirectoryAtPath("path/to/dir"); // or addDirectoryAtPathIfExists
```

### Creating

On a directory

```ts
const childDir = directory.createDirectory("childDir");
```

Or main `project` object:

```ts
const directory = project.createDirectory("path/to/dir");
```

## Directory

### Path and name

```ts
// returns the full path (ex. /home/david/project/)
const path = directory.getPath();

// returns only the directory name (ex. project)
const baseName = directory.getBaseName();
```

### Parent directory

```ts
const parentDir = directory.getParent(); // or getParentOrThrow()
```

### Child directories

```ts
const childDirs = directory.getDirectories();
```

### Ancestor / Descendant

Check if a directory is an ancestor or descendant of another directory:

```ts setup: let grandParentDir: Directory, childDir: Directory;
grandParentDir.isAncestorOf(childDir);   // true
childDir.isDescendantOf(grandParentDir); // true
```

Or if a directory is an ancestor of a source file:

```ts setup: let grandParentDir: Directory, parentDir: Directory, childSourceFile: SourceFile;
grandParentDir.isAncestorOf(childSourceFile); // true
parentDir.isAncestorOf(childSourceFile);      // true
```

### Source files

```ts
const sourceFiles = directory.getSourceFiles();
const sourceFile = directory.getSourceFile("someFile.ts"); // or getSourceFileOrThrow
const indexFile = directory.addSourceFileAtPath("index.ts"); // or addSourceFileAtPathIfExists
const descendantSourceFiles = directory.getDescendantSourceFiles();

directory.createSourceFile("someFile.ts");
directory.createSourceFile("someFile2.ts", "// some text");
directory.createSourceFile("someFile3.ts", writer => writer.writeLine("// some text"));
directory.createSourceFile("someFile4.ts", { statements: [{ kind: StructureKind.Enum, name: "MyEnum" }] });
```

### Saving

Save the directory to the disk and all the unsaved source files:

```ts
await directory.save();
directory.saveSync(); // slow
```

### Emitting

It's possible to only specific directories:

```ts
// always check result.getEmitSkipped() to make sure the emit was successful
const result = await directory.emit();
directory.emitSync(); // slow
```

Or specify the output directories (specify a path relative from the directory or an absolute paths):

```ts
directory.emit({
    outDir: "out",
    declarationDir: "declarations"
});
```

And of course, specify to only emit declaration files:

```ts
directory.emit({ emitOnlyDtsFiles: true });
```

### Moving

Move the directory to a new directory:

```ts setup: const otherDir: Directory;
// ex. moves C:\MyProject\dir to C:\MyProject\newDir if working directory is C:\MyProject
directory.move("./newDir");
// ex. moves C:\MyProject\newDir to C:\MyProject\otherDir using a relative path
directory.move("../otherDir", { overwrite: true }); // allows overwriting (otherwise it will throw)
// or specify an absolute path
directory.move("C:\\finalDir");
// or specify the directory to move to
directory.moveToDirectory("some/directory");
directory.moveToDirectory(otherDir);
```

### Moving Immediately

Moving a directory immediately can be done by using one of the following methods:

```ts
await directory.moveImmediately("../newDir");
// or
directory.moveImmediatelySync("../newDir2");
```

### Copying

Copy the directory to a new directory:

```ts setup: const otherDir: Directory;
// ex. copies C:\MyProject\dir to C:\MyProject\newDir
directory.copy("../newDir");
// allows overwriting (otherwise it will throw)
directory.copy("../nextDir", { overwrite: true });
// or specify an absolute path
directory.copy("C:\\test");
// or specify the directory to copy to
directory.copyToDirectory("some/directory");
directory.copyToDirectory(otherDir);
```

Note that the directory and source files, in all these cases, won't be created until calling save on the project.

#### Not including untracked files

When moving a directory, it will queue up a file system copy for the directory from to the directory to. If you only wish to copy the source files that are found in memory within the directory, then set the `includeUntrackedFiles` option to false:

```
directory.copy("../finalDir", { includeUntrackedFiles: false });
```

### Copying Immediately

Copying a directory immediately can be done by using one of the following methods:

```ts
await directory.copyImmediately("../otherDir");
// or
directory.copyImmediatelySync("../otherDir2");
```

### Deleting

Call:

```ts
directory.delete();
```

This will remove the directory object and all its descendant source files and directories from the main `project` object and queue it up for deletion to the file system.

When you're all done your other manipulations, call `project.save()` and at that point the directory will be deleted.

#### Deleting immediately

If you want to delete a directory immediately from the file system, then use the following:

```ts
await directory.deleteImmediately();
// or
directory.deleteImmediatelySync();
```

This isn't recommended though because it could possibly leave the file system in a halfway state if your code errors before it's done.

### Clearing

Call:

```ts
directory.clear();
```

This will delete the directory's descendants in memory and queue a delete and mkdir operation to the file system.

#### Clearing immediately

If you want to do this operation immediatley to the file system, then use the following:

```ts
await directory.clearImmediately();
// or
directory.clearImmediatelySync();
```

This isn't recommended though because it could possibly leave the file system in a halfway state if your code errors before it's done.

### Forgetting

Forgets the directory from main project object without deleting it:

```ts
directory.forget();
```

Note that after doing this, the directory object and all its descendant source files and directories will not be available. If you want to use them again,
then you will need to re-add them.

### Relative File Paths

It might be useful to get the relative path from one directory to another source file or directory.

```ts setup: let directoryFrom: Directory, sourceFileTo: SourceFile;
const relativePath = directoryFrom.getRelativePathTo(sourceFileTo);
```

Or to get the module specifier text from one directory to another source file or directory.

```ts setup: let directoryFrom: Directory, sourceFileTo: SourceFile;
const moduleSpecifier = directoryFrom.getRelativePathAsModuleSpecifierTo(sourceFileTo);
```
