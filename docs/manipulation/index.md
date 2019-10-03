---
title: Manipulating Source Files
---

## Manipulating Source Files

Most information about manipulation can be found in the [Details](../details) section. This section only contains general information about manipulation.

### Saving Changes

All moves, copies, and deletes won't be propagated to the underlying file system until `save()` is called on the main `project` object.

```ts
import { Project } from "ts-morph";

const project = new Project();

// ...lots of code here that manipulates, copies, moves, and deletes files...

// when you're all done, call this and it will save everything to the file system
project.save();
```

The above is recommended because it means if your code errors halfway through, the files won't be in a halfway state. However, there's always a way to save, move, copy, and delete while immediately having these changes happen on the underlying file system. For example:

```ts
// or use the synchronous alternatives (ex. saveSync())
await sourceFile.save();
await sourceFile.deleteImmediately();
await sourceFile.copyImmediately("copiedFile.ts");
await sourceFile.moveImmediately("movedFile.ts");

await directory.save();
await directory.deleteImmediately();
await directory.copyImmediately("CopiedDir");
await directory.moveImmediately("MovedDir");
```

### Replacing any node with new text

Use the `.replaceWithText(...)` method that exists on any node.

This will replace the text from the `Node#getStart(true)` position (start position with js docs) to `Node#getEnd()`. Use `Node#getText(true)` to get all the text that will be replaced.

#### Example

Given the following code:

```ts setup: let Some: any;
let myVariable = Some.Property.Access.Expression;
```

You can replace the property access expression with new text by doing the following:

```ts
const originalInitializer = sourceFile.getVariableDeclarations()[0].getInitializerOrThrow();
const newInitializer = originalInitializer.replaceWithText("MyReference");
```

That will make the source file hold the following text:

```ts setup: let MyReference: any;
let myVariable = MyReference;
```

Note that `originalInitializer` will be forgotten after calling `.replaceWithText(...)` on it—an error will be thrown if you try to use it.
You will have to use the new node returned by that method.

### Adding, inserting, and removing statements

Statements can be added, inserted, or removed from nodes with a body (ex. functions, methods, namespaces, source files).

```ts
// add statements
const statements = sourceFile.addStatements("console.log(5);\nconsole.log(6);");
// insert statements (index is the child index to insert at)
const statements = sourceFile.insertStatements(3, "console.log(5);\nconsole.log(6);");
// remove statements
sourceFile.removeStatements([1, 3]); // removes statements from index 1 to 3
sourceFile.removeStatement(1);       // removes statement at index 1
```

When adding or inserting, you can also write using a [code writer](code-writer):

```ts
functionDeclaration.addStatements(writer => {
    writer.write("if (true)").block(() => {
        writer.write("something;");
    });
});
```

### Inserting, replacing, and removing any text

In some scenarios, a simple to use API might not have been implemented. If you find that's the case, open an issue on GitHub.

In the meantime, you can insert, replace, and remove text using the following methods, but *generally you will want to avoid using these if possible*:

```ts
// insert text
sourceFile.insertText(0, writer => writer.writeLine("// some comment")); // or provide a string
// replace text
sourceFile.replaceText([3, 7], "a"); // "// a comment\n"
// remove text
sourceFile.removeText(sourceFile.getPos(), sourceFile.getEnd());
```

These methods are also available on any node that has a body (functions, classes, enums, etc.)

#### **Warning**

If you use `insertText`, `replaceText`, or `removeText`, all previously navigated descendants of the node will be forgotten and not be available for use—an error will be thrown
if you try to use them. You will have to renavigate to those nodes.

For example:

```ts
let classDeclaration = sourceFile.addClass({ name: "MyClass" });
sourceFile.insertText(0, "// some comment\n");

// this will throw...
classDeclaration.getInstanceProperties();

// you'll need to get the reference again:
classDeclaration = sourceFile.getClass("MyClass")!;
```

## Code Fixes

There are a variety of useful code fixes and refactors such as:

* `SourceFile#organizeImports()`
* `SourceFile#fixMissingImports()`
* `SourceFile#fixUnusedIdentifiers()`

Check more details on the [source files details page](../details/source-files).
