---
title: Navigating Existing Nodes
---

## Navigating Existing Nodes

Sometimes you might want to easily navigate an existing compiler node created outside this library.

Do that by using the `createWrappedNode` function:

```typescript
import * as ts from "typescript";
import {createWrappedNode, ClassDeclaration} from "ts-simple-ast";

// some code that creates a class declaration (could be any kind of ts.Node)
const classNode: ts.ClassDeclaration = ...; 

// create and use a wrapped node
const classDec = createWrappedNode(classNode) as ClassDeclaration;
const firstProperty = classDec.getProperties()[0];

// ... do more stuff here ...
```

**Note:** This is a lightweight way to navigate a node, but there are certian functionalities you can't use since there is no language service, type checker, or program.
For example, getting the type of a node will not work because that requires a type checker.

For now, you can always get the underlying compiler node from a wrapped node and use that with your existing compiler objects (ex. TypeChecker),
but in the future [#42](https://github.com/dsherret/ts-simple-ast/issues/42) is being worked on.
