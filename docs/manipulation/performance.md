---
title: Performance
---

## Performance

There's a lot of opportunity for performance improvements. The library originally started off favouring correctness, but it's now starting to switch to improving performance.

Issues: [#224](https://github.com/dsherret/ts-simple-ast/issues/224), [#141](https://github.com/dsherret/ts-simple-ast/issues/141), [#142](https://github.com/dsherret/ts-simple-ast/issues/142)

## Overview

This library makes manipulations easy for you by keeping track of how the underlying syntax tree changes between manipulations.

Behind the scenes, when you manipulate the AST:

1. A new source file is created using the TypeScript compiler.
2. The previously navigated nodes have their underlying compiler nodes replaced with the new compiler nodes.

It's why you can do this:

```ts
// sourcefile contains: interface Person { name: string; }
const personInterface = sourceFile.getInterfaceOrThrow("Person");
const nameProperty = personInterface.getPropertyOrThrow("name");
nameProperty.setType("number");
nameProperty.getText(); // "name: number;"
```

Instead of having to renavigate the tree after each manipulation:

```ts
// thankfully the library does not work this way
let personInterface = sourceFile.getInterfaceOrThrow("Person");
let nameProperty = personInterface.getPropertyOrThrow("name");
nameProperty.setType("number");
nameProperty.getText(); // "name: string;"
personInterface = sourceFile.getInterfaceOrThrow("Person");
nameProperty = personInterface.getPropertyOrThrow("name");
nameProperty.getText(); // "name: number;"
```

When thinking about performance, the key point here is that if you have a lot of previously navigated nodes and a very large file, then manipulation might start to become sluggish.

### Forgetting Nodes (Advanced)

The main way to improve performance when manipulating, is to "forget" a node when you're done with it.

```ts
personInterface.forget();
```

That will stop tracking the node and all its previously navigated descendants (ex. in this case, `nameProperty` as well).
It won't be updated when manipulation happens again. Note that after doing this, the node will throw an error if one of its properties or methods is accessed.

### Forget Blocks (Advanced)

It's possible to make sure all created nodes within a block are forgotten:

```ts
import {Ast, NamespaceDeclaration, InterfaceDeclaration, ClassDeclaration} from "ts-simple-ast";

const ast = new Ast();
const text = "namespace Namespace { interface Interface {} class Class {} }";
const sourceFile = ast.createSourceFile("file.ts", text);

let namespaceDeclaration: NamespaceDeclaration;
let interfaceDeclaration: InterfaceDeclaration;
let classDeclaration: ClassDeclaration;

ast.forgetNodesCreatedInBlock(remember => {
    namespaceDeclaration = sourceFile.getNamespaceOrThrow("Namespace");
    interfaceDeclaration = namespaceDeclaration.getInterfaceOrThrow("Interface");
    classDeclaration = namespaceDeclaration.getClassDeclarationOrThrow("Class");

    // you can mark nodes to remember outside the scope of this block...
    // this will remember the specified node and all its ancestors
    remember(interfaceDeclaration); // or pass in multiple nodes
});

namespaceDeclaration.getText(); // ok, child was marked to remember
interfaceDeclaration.getText(); // ok, was explicitly marked to remember
classDeclaration.getText();     // throws, was forgotten
```

Also, do not be concerned about nesting forget blocks. That is perfectly fine to do:

```ts
ast.forgetNodesCreatedInBlock(() => {
    namespaceDeclaration = sourceFile.getNamespaceOrThrow("Namespace");
    interfaceDeclaration = namespaceDeclaration.getInterfaceOrThrow("Interface");

    ast.forgetNodesCreatedInBlock(remember => {
        classDeclaration = namespaceDeclaration.getClassDeclarationOrThrow("Class");
        remember(namespaceDeclaration);
    });

    classDeclaration.getText();     // throws, was forgotten outside the block above
    interfaceDeclaration.getText(); // ok, hasn't been forgotten yet
});

namespaceDeclaration.getText(); // ok, was marked to remember in one of the blocks
interfaceDeclaration.getText(); // throws, was forgotten
classDeclaration.getText();     // throws, was forgotten
```

#### Async

This method supports async and await:

```ts
await ast.forgetNodesCreatedInBlock(async remember => {
    // do stuff
});
```
