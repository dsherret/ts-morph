---
title: Underlying Compiler Nodes
---

## Underlying Compiler Nodes

Sometimes it might be useful to get the node from the TypeScript compiler.

They're accessible via the `.compilerNode` property that's found on most objects:

```ts
const compilerNode = personInterface.compilerNode;
```

**Warning:** When manipulating the AST via this library, the underlying TypeScript AST tree is regenerated each time. For this reason, it's important not
to hold on to TypeScript compiler nodes between manipulations or you could end up working with out of date information.

### Compiler node properties

Sometimes there isn't a helper function in this library for accessing certain properties on the underlying compiler node.

In these situations, you can access any underlying compiler node property by using the `.getNodeProperty(propName)` method:

```ts
const nameNode = propertyAccessExpression.getNodeProperty("name"); // returns: Node<ts.PropertyName>
```

**Note:** This currently only works on properties that are a single node.
