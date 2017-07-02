---
title: Navigating Existing Nodes
---

## Navigating Existing Nodes

Sometimes you might want to easily navigate an existing compiler node created elsewhere.

You can do that using this library by using the `createWrappedNode` function:

```typescript
import * as ts from "typescript";
import {createWrappedNode, ClassDeclaration} from "ts-simple-ast";

// ... other code that creates a ts.Node ...

const classDec = createWrappedNode(classNode) as ClassDeclaration;
const firstProperty = classDec.getProperties()[0];

// ... do stuff here ...
```

**Next step:** [Manipulating the AST](../manipulation/index)
