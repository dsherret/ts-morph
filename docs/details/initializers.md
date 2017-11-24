---
title: Initializers
---

## Initializers

### Getting

For example, given the following code:

```typescript
const add = function(a: number, b: number) { return a + b; };
```

The initializer can be retrieved in any of these ways:

```typescript
variableDeclaration.getInitializer(); // returns: Expression | undefined
variableDeclaration.getInitializerOrThrow(); // returns: Expression
variableDeclaration.getInitializerIfKind(ts.SyntaxKind.FunctionExpression); // returns: Expression | undefined
variableDeclaration.getInitializerIfKindOrThrow(ts.SyntaxKind.FunctionExpression); // returns: Expression
```

In a future release, `getInitializerIfKind` will be limited to only the supported syntax kinds of `Expression` and will return the type of the provided syntax kind (follow issue #138 for details).

### Removing

Use `.removeInitializer()` on the parent node. For example:

```typescript
variableDeclaration.removeInitializer();
```

### Setting

Use `.setInitializer(...)`:

```typescript
variableDeclaration.setInitializer("2 + 2");
```
