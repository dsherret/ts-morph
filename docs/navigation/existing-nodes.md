---
title: Navigating Existing Nodes
---

## Navigating Existing Nodes

Sometimes you might want to easily navigate an existing compiler node created outside this library.

Do that by using the `createWrappedNode` function:

```ts
import * as ts from "typescript";
import {createWrappedNode, ClassDeclaration} from "ts-simple-ast";

// some code that creates a class declaration (could be any kind of ts.Node)
const classNode: ts.ClassDeclaration = ...; 

// create and use a wrapped node
const classDec = createWrappedNode(classNode) as ClassDeclaration;
const firstProperty = classDec.getProperties()[0];

// ... do more stuff here ...
```

**Note:** This is a lightweight way to navigate a node, but there are certian functionalities which will throw an error since there is no
language service, type checker, or program. For example, finding references will not work because that requires a language service.

### Providing Type Checker

If you would like to easily get the type information of the types in the provided source file, then provide a type checker:

```ts
// given an existing node and type checker
const classNode: ts.ClassDeclaration = ...;
const typeChecker: ts.TypeChecker = ...;

// create and use a wrapped node
const classDec = createWrappedNode(classNode, { typeChecker }) as ClassDeclaration;
console.log(classDec.getPropertyOrThrow("propName").getType().getText()); // ok, because a type checker was provided
```
