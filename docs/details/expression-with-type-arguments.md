---
title: Expression With Type Arguments
---

## Expression With Type Arguments

These are found in certain areas. For example `extends` and `implements` expressions.

### Getting expression

Currently only the compiler expression is available. There is no wrapper:

```typescript
// returns: ts.LeftHandSideExpression
const compilerExpression = expressionWithTypeArgs.getCompilerExpression();
```

### Getting type arguments

```typescript
const typeArgs = expressionWithTypeArgs.getTypeArguments(); // returns: TypeNode[]
```
