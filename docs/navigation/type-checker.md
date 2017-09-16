---
title: Type Checker
---

## Type Checker

Get the type checker by calling:

```typescript
const typeChecker = ast.getTypeChecker();
```

### Underlying compiler object

The underlying `ts.TypeChecker` can be retrieved as follows:

```typescript
const tsTypeChecker = typeChecker.compilerObject;
```

**Warning:** The underlying compiler object will be discared whenever manipulation occurs. For that reason, only hold onto the underlying compiler object between manipulations.

### Use

Generally you won't need to use the type checker, because most of the functionality is exposed as methods on the wrapped compiler objects.

It may be useful in certain instances to use the type checker though.

### Getting type at location

Get the type of any node by calling:

```typescript
const typeOfNode = typeChecker.getTypeAtLocation(node);
```
