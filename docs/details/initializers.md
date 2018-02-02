---
title: Initializers
---

## Initializers

### Getting

For example, given the following code:

```ts
const add = function(a: number, b: number) { return a + b; };
```

The initializer can be retrieved in any of these ways:

```ts
variableDeclaration.getInitializer(); // returns: Expression | undefined
variableDeclaration.getInitializerOrThrow(); // returns: Expression
variableDeclaration.getInitializerIfKind(ts.SyntaxKind.FunctionExpression); // returns: Expression | undefined
variableDeclaration.getInitializerIfKindOrThrow(ts.SyntaxKind.FunctionExpression); // returns: Expression
```

### Removing

Use `.removeInitializer()` on the parent node. For example:

```ts
variableDeclaration.removeInitializer();
```

### Setting

Use `.setInitializer(...)`:

```ts
variableDeclaration.setInitializer("2 + 2");
```
