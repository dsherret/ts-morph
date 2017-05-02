---
title: Expressions
---

## Expression With Type Arguments

These are found in certain areas. For example `extends` and `implements` expressions.

### Getting expression

```typescript
// returns: ts.LeftHandSideExpression
const expression = expressionWithTypeArgs.getExpression(); // returns: Node
```

### Getting type arguments

```typescript
const typeArgs = expressionWithTypeArgs.getTypeArguments(); // returns: TypeNode[]
```
