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

### Add/Insert

Add or insert interfaces to a source file, namespace, or function like declarations by calling `addInterface()`, `addInterfaces()`, `insertInterface()`, or `insertInterfaces()`.

```typescript
const interfaceDeclaration = sourceFile.addInterface({
    name: "InterfaceName"
});
```

### Remove

Call `.remove()`:

```typescript
interfaceDeclaration.remove();
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

Remove an expression:

```typescript
interfaceDeclaration.removeExtends(0); // index
interfaceDeclaration.removeExtends(interfaceDeclaration.getExtends()[0]); // node
```

### Construct signatures

Use:

```typescript
const constructSignatures = interfaceDeclaration.getConstructSignatures();
const constructSignature = interfaceDeclaration.getConstructSignature(c => c.getParameters().length > 2);
```

#### Add/Insert

To add or insert use `addConstructSignature()`, `addConstructSignatures()`, `insertConstructSignature`, or `insertConstructSignatures()`:

```typescript
const constructSignature = interfaceDeclaration.addConstructSignature({ returnType: "SomeClass" });
```

#### Remove

Remove a construct signature:

```typescript
constructSignature.remove();
```

### Method signatures

Use:

```typescript
const methodSignatures = interfaceDeclaration.getMethods();
const myMethod = interfaceDeclaration.getMethod("myMethod");
const firstMethodWith4Params = interfaceDeclaration.getMethod(m => m.getParameters().length === 4);
```

#### Add/Insert

To add or insert use `addMethod()`, `addMethods()`, `insertMethod`, or `insertMethods()`:

```typescript
const methodSignature = interfaceDeclaration.insertMethod(1, { name: "newMethod", returnType: "boolean" });
```

#### Remove

Remove a method signature:

```typescript
methodSignature.remove();
```

### Properties

Use:

```typescript
const properties = interfaceDeclaration.getProperties();
const myProperty = interfaceDeclaration.getProperty("myProperty");
const firstStringProperty = interfaceDeclaration.getProperty(p => p.getType().getText() === "string");
```

#### Add/Insert

To add or insert use `addProperty()`, `addProperties()`, `insertProperty`, or `insertProperties()`:

```typescript
const propertySignature = interfaceDeclaration.insertProperty(1, { name: "newProperty", type: "string" });
```

#### Remove

Remove a property signature:

```typescript
propertySignature.remove();
```

### Implementations

Get the implementations.

```typescript
const implementations = interfaceDeclaration.getImplementations();
```

Similar to "go to implementation" command available in IDEs.
