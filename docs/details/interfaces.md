---
title: Interfaces
---

## Interface Declarations

Interface declarations can be retrieved from source files, namespaces, or function bodies:

```typescript
const interfaces = sourceFile.getInterfaces();
const interface1 = sourceFile.getInterface("Interface1");
const firstInterfaceWith5Properties = sourceFile.getInterface(i => i.getProperties().length === 5);
```

### Get extends expressions

```typescript
const extendsExpressions = interfaceDeclaration.getExtendsExpressions();
```

Will return [`ExpressionWithTypeArguments[]`](expressions).

### Get method signatures

Use:

```typescript
const methodSignatures = interfaceDeclaration.getMethods();
```

### Get properties

Use:

```typescript
const properties = interfaceDeclaration.getProperties();
```

### Get new signatures

TODO: Not implemented yet.
