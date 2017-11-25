---
title: Performance
---

## Performance

This library makes manipulations easy for you by keeping track of how the underlying syntax tree changes between manipulations.

Behind the scenes, when you manipulate the AST:

1. A new source file is created using the TypeScript compiler.
2. The previously navigated nodes have their underlying compiler nodes replaced with the new compiler nodes.

It's why you can do this:

```typescript
// sourcefile contains: interface Person { name: string; }
const personInterface = sourceFile.getInterfaceOrThrow("Person");
const nameProperty = personInterface.getPropertyOrThrow("name");
nameProperty.setType("number");
nameProperty.getText(); // "name: number;"
```

Instead of having to renavigate the tree after each manipulation:

```typescript
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

### Forgetting Nodes

The main way to improve performance when manipulating, is to "forget" a node when you're done with it.

```typescript
personInterface.forget();
```

That will stop tracking the node and all its previously navigated descendants (ex. in this case, `nameProperty` as well).
It won't be updated when manipulation happens again. Note that after doing this, the node will throw an error if one of its properties or methods is accessed.
