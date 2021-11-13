---
title: Type Parameters
---

## Type Parameters

Type parameters can be retreived from nodes by calling `getTypeParameters()`:

```ts
const typeParameters = classDeclaration.getTypeParameters();
```

### Inserting/Adding

Insert or add type parameters by calling `insertTypeParameter()`, `insertTypeParameters()`, `addTypeParameter()`, or `addTypeParameters()`.

For example:

```ts
const typeParameter = classDeclaration.insertTypeParameter(1, {
  name: "T",
  constraint: "string", // optional
});
```

### Removing

Remove a type parameter by calling `.remove()` on it:

```ts
typeParameter.remove();
```

### Constraint

Get the constraint type node:

```ts
const constraint = typeParameter.getConstraint(); // returns: TypeNode | undefined
```

Or set the constraint:

```ts
typeParameter.setConstraint("string");
```

Or remove it:

```ts
typeParameter.removeConstraint();
```

### Default

Get the default type node:

```ts
const defaultNode = typeParameter.getDefault(); // returns: TypeNode | undefined
```

Or set the default type node:

```ts
typeParameter.setDefault("string");
```

Or remove it:

```ts
typeParameter.removeDefault();
```
