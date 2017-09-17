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

## Call Expressions

Call expressions are statements that call a function:

```typescript
doSomething();
```

### Getting call signatures

From a given node, get all the children or descendants that are call expressions.

For example:

```typescript
const childCallExpressions = node.getChildrenOfKind(ts.SyntaxKind.CallExpression);
const descendantCallExpressions = node.getDescendantsOfKind(ts.SyntaxKind.CallExpression);
```

### Return type

Use the following:

```typescript
const returnType = callExpression.getReturnType();
```
