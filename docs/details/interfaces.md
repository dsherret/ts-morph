---
title: Interfaces
---

## Interface Declarations

Interface declarations can be retrieved from source files, namespaces, or function bodies:

```ts
const interfaces = sourceFile.getInterfaces();
const interface1 = sourceFile.getInterface("Interface1");
const firstInterfaceWith5Properties = sourceFile.getInterface(i => i.getProperties().length === 5);
```

### Add/Insert

Add or insert interfaces to a source file, namespace, or function like declarations by calling `addInterface()`, `addInterfaces()`, `insertInterface()`, or `insertInterfaces()`.

```ts
const interfaceDeclaration = sourceFile.addInterface({
    name: "InterfaceName"
});
```

### Remove

Call `.remove()`:

```ts
interfaceDeclaration.remove();
```

### Extends expressions

Will return [`ExpressionWithTypeArguments[]`](expressions):

```ts
const extendsExpressions = interfaceDeclaration.getExtends();
```

Add or insert extends expressions:

```ts
interfaceDeclaration.addExtends("Named");
interfaceDeclaration.addExtends(["Named", "Aged"]);
interfaceDeclaration.insertExtends(1, "Named");
interfaceDeclaration.insertExtends(2, ["Named", "Aged"]);
```

Remove an expression:

```ts
interfaceDeclaration.removeExtends(0); // index
interfaceDeclaration.removeExtends(interfaceDeclaration.getExtends()[0]); // node
```

### Members

Get all the members of the interface:

```ts
const members = interfaceDeclaration.getAllMembers();
```

### Construct signatures

Use:

```ts
const constructSignatures = interfaceDeclaration.getConstructSignatures();
const constructSignature = interfaceDeclaration.getConstructSignature(c => c.getParameters().length > 2);
```

#### Add/Insert

To add or insert use `addConstructSignature()`, `addConstructSignatures()`, `insertConstructSignature`, or `insertConstructSignatures()`:

```ts
const constructSignature = interfaceDeclaration.addConstructSignature({ returnType: "SomeClass" });
```

#### Remove

Remove a construct signature:

```ts
constructSignature.remove();
```

### Call signatures

Use:

```ts
const callSignatures = interfaceDeclaration.getCallSignatures();
const callSignature = interfaceDeclaration.getCallSignature(c => c.getParameters().length > 2);
```

#### Add/Insert

To add or insert use `addCallSignature()`, `addCallSignatures()`, `insertCallSignature`, or `insertCallSignatures()`:

```ts
const callSignature = interfaceDeclaration.addCallSignature({ returnType: "SomeClass" });
```

#### Remove

Remove a call signature:

```ts
callSignature.remove();
```

### Index signatures

Use:

```ts
const indexSignatures = interfaceDeclaration.getIndexSignatures();
const indexSignature = interfaceDeclaration.getIndexSignature(s => s.getKeyName() === "keyName");
```

#### Add/Insert

To add or insert use `addIndexSignature()`, `addIndexSignatures()`, `insertIndexSignature`, or `insertIndexSignatures()`:

```ts
const indexSignature = interfaceDeclaration.addIndexSignature({
    keyName: "someKey", // defaults to key
    keyType: "string", // defaults to string
    returnType: "SomeClass"
});
```

#### Remove

Remove an index signature:

```ts
indexSignature.remove();
```

### Method signatures

Use:

```ts
const methodSignatures = interfaceDeclaration.getMethods();
const myMethod = interfaceDeclaration.getMethod("myMethod");
const firstMethodWith4Params = interfaceDeclaration.getMethod(m => m.getParameters().length === 4);
```

#### Add/Insert

To add or insert use `addMethod()`, `addMethods()`, `insertMethod`, or `insertMethods()`:

```ts
const methodSignature = interfaceDeclaration.insertMethod(1, { name: "newMethod", returnType: "boolean" });
```

#### Remove

Remove a method signature:

```ts
methodSignature.remove();
```

### Properties

Use:

```ts
const properties = interfaceDeclaration.getProperties();
const myProperty = interfaceDeclaration.getProperty("myProperty");
const firstStringProperty = interfaceDeclaration.getProperty(p => p.getType().getText() === "string");
```

#### Add/Insert

To add or insert use `addProperty()`, `addProperties()`, `insertProperty`, or `insertProperties()`:

```ts
const propertySignature = interfaceDeclaration.insertProperty(1, { name: "newProperty", type: "string" });
```

#### Remove

Remove a property signature:

```ts
propertySignature.remove();
```

### Base Types

```ts
const baseTypes = interfaceDeclaration.getBaseTypes();
```

### Base Declarations

Gets the base interface, type alias, or class declarations:

```ts
const baseDeclarations = interfaceDeclaration.getBaseDeclarations();
```

### Implementations

Get the implementations.

```ts
const implementations = interfaceDeclaration.getImplementations();
```

Similar to "go to implementation" command available in IDEs.
