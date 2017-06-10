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

Add or insert extends expressions:

```typescript
interfaceDeclaration.addExtends("Named");
interfaceDeclaration.addExtends(["Named", "Aged"]);
interfaceDeclaration.insertExtends(1, "Named");
interfaceDeclaration.insertExtends(2, ["Named", "Aged"]);
```

### Method signatures

Use:

```typescript
const methodSignatures = interfaceDeclaration.getMethods();
```

To add or insert use `addMethod()`, `addMethods()`, `insertMethod`, or `insertMethods()`:

```typescript
const methodSignature = interfaceDeclaration.insertMethod(1, { name: "newMethod", returnType: "boolean" });
```

### Properties

Use:

```typescript
const properties = interfaceDeclaration.getProperties();
```

To add or insert use `addProperty()`, `addPropertys()`, `insertProperty`, or `insertPropertys()`:

```typescript
const propertySignature = interfaceDeclaration.insertProperty(1, { name: "newProperty", type: "string" });
```

### Construct signatures

Use:

```typescript
const constructSignatures = interfaceDeclaration.getConstructSignatures();
```
