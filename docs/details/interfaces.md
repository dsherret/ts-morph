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

### Extends expressions

Will return [`ExpressionWithTypeArguments[]`](expressions):

```typescript
const extendsExpressions = interfaceDeclaration.getExtends();
```

Add an extends expression:

```typescript
interfaceDeclaration.addExtends("Named");
```

### Method signatures

Use:

```typescript
const methodSignatures = interfaceDeclaration.getMethods();
```

### Properties

Use:

```typescript
const properties = interfaceDeclaration.getProperties();
```

### New signatures

TODO: Not implemented yet.
