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
const childDirectory = directory.addExistingDirectory("childDir"); // or addExistingDirectoryIfExists
```

Or main `project` object:

```ts
const directory = project.addExistingDirectory("path/to/dir"); // or addExistingDirectoryIfExists
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
const indexFile = directory.addExistingSourceFile("index.ts"); // or addExistingSourceFileIfExists
const descendantSourceFiles = directory.getDescendantSourceFiles();
```

### Saving

Save the directory to the disk and all the unsaved source files:

```ts
directory.save();
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

Call:

```ts
directory.delete();
```

This will remove the directory object and all its descendant source files and directories from the main `project` object and queue it up for deletion to the file system.

When you're all done your other manipulations, call `project.save()` and at that point the directory will be deleted.

#### Deleting immediately

If you want to delete a directory immediately from the file system, then use the following:

```ts
directory.deleteImmediately();
// or
directory.deleteImmediatelySync();
```

This isn't recommended though because it could possibly leave the file system in a halfway state if your code errors before it's done.

### Removing

Removes from main project object without deleting it:

```ts
directory.remove();
```

Note that after doing this, the directory object and all its descendant source files and directories will not be available. If you want to use them again,
then you will need to re-add them.
