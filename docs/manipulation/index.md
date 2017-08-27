---
title: Manipulating the AST
---

## Manipulating the AST

Most information about manipulation can be found in the [Details](../details) section. This section only contains general information about manipulation.

### Inserting, replacing, and removing text

In some scenarios, a simple to use API might not have been implemented. If you find that's the case, open an issue on GitHub.

In the meantime, you can insert, replace, and remove text using the following methods, but *generally you will want to avoid using these if possible*:

```typescript
// insert text
sourceFile.insertText(0, "// some comment\n");
// replace text
sourceFile.replaceText([3, 7], "a"); // "// a comment\n"
// remove text
sourceFile.removeText([sourceFile.getPos(), sourceFile.getEnd()]);
```

These methods are also available on any node that has a body (functions, classes, enums, etc.)

<aside class="warning">
**WARNING:** If you use these methods, all previously navigated descendants of the node will be disposed and not be available for use (an exception will be thrown
if you try to use them). You will have to renavigate to those nodes.
</aside>
