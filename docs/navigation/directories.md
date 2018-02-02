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

Or from the main ast object:

```ts
ast.getRootDirectories(); // gets directories without a parent
ast.getDirectories(); // gets all the directories
ast.getDirectory("path/to/directory");
ast.getDirectoryOrThrow("path/to/directory");
```

### Adding

On a directory:

```ts
const childDirectory = directory.addExistingDirectory("childDir"); // or addDirectoryIfExists
```

Or main ast object:

```ts
const directory = ast.addExistingDirectory("path/to/dir"); // or addDirectoryIfExists
```

### Creating

On a directory

```ts
const childDir = directory.createDirectory("childDir");
```

Or main ast object:

```ts
const directory = ast.createDirectory("path/to/dir");
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

```ts
grandParentDir.isAncestorOf(childDir);   // true
childDir.isDescendantOf(grandParentDir); // true
```

Or if a directory is an ancestor of a source file:

```ts
grandParentDir.isAncestorOf(childSourceFile); // true
parentDir.isAncestorOf(childSourceFile);      // true
```

### Source files

```ts
const sourceFiles = directory.getSourceFiles();
const sourceFile = directory.getSourceFile("someFile.ts"); // or getSourceFileOrThrow
const indexFile = directory.addExistingSourceFile("index.ts"); // or addSourceFileIfExists
const descendantSourceFiles = directory.getDescendantSourceFiles();
```

### Saving

Save all the unsaved source files:

```ts
directory.saveUnsavedSourceFiles();
directory.saveUnsavedSourceFilesSync(); // slow
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

### Copying

Copy the directory to a new directory:

```
// ex. copies C:\MyProject\dir to C:\MyProject\newDir
directory.copy("../newDir");
directory.copy("../newDir", { overwrite: true }); // don't throw if it will overwrite a file
directory.copy("C:\\test"); // or absolute
```

Note that the directory and source files, in all these cases, won't be created until calling save on them.

### Deleting

Deletes the directory and all its descendants from the file system:

```ts
directory.delete();
// or
directory.deleteSync();
```

Note that after doing this, the directory object and all its descendant source files and directories will not be available.

### Removing

Removes from main ast object:

```ts
directory.remove();
```

Note that after doing this, the directory object and all its descendant source files and directories will not be available. If you want to use them again,
then you will need to re-add them.
