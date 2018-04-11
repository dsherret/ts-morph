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

## Navigating Existing Compiler Nodes

Sometimes you might want to easily navigate an existing compiler node.

Do that by using the `createWrappedNode` function:

```ts
import {createWrappedNode, ClassDeclaration, ts} from "ts-simple-ast";

// some code that creates a class declaration using the ts object
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
