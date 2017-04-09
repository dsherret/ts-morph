---
title: Underlying Compiler Nodes
---

## Underlying Compiler Nodes

Sometimes it might be useful to get the node from the TypeScript compiler.

They're accessible via the `.getCompilerNode()` method that's found on most objects:

```typescript
const compilerNode = personInterface.getCompilerNode();
```

**Warning:** When manipulating the AST via this library, the underlying TypeScript AST tree is regenerated each time. For this reason, it's important not
to hold on to TypeScript compiler nodes between manipulations or you could end up working with out of date information.

**Next step:** [Manipulating the AST](../manipulation/index)
