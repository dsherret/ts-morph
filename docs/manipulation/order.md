---
title: Order
---

## Order

Change the order of certain nodes using the `.setOrder(newIndex: number)` method.

```ts
const interfaceDeclaration = sourceFile.getInterfaceOrThrow("MyInterface");
interfaceDeclaration.setOrder(2);
```

Notice: Right now this is not supported on comma separated nodes. See [Issue #44](https://github.com/dsherret/ts-simple-ast/issues/44) for more information.
