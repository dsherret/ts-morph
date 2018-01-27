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
