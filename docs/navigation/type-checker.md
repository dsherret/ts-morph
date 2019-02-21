---
title: Type Checker
---

## Type Checker

Get the type checker by calling:

```ts
const typeChecker = project.getTypeChecker();
```

### Underlying compiler object

The underlying `ts.TypeChecker` can be retrieved as follows:

```ts
const tsTypeChecker = typeChecker.compilerObject;
```

**Warning:** The underlying compiler object will be discared whenever manipulation occurs. For that reason, only hold onto the underlying compiler object between manipulations.

### Use

Generally you won't need to use the type checker because most of the functionality is exposed as methods on other objects.

### Signature Resolution

Get the resolved signature of a call-like expression node (ex. call expression):

```ts
const resolvedSignature = typeChecker.getResolvedSignature(callLikeExpression);
```
