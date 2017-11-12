---
title: Classes
---

## Class Declarations

Class declarations can be retrieved from source files, namespaces, or function bodies:

```typescript
const classes = sourceFile.getClasses();
const class1 = sourceFile.getClass("Class1");
const firstClassWithConstructor = sourceFile.getClass(c => c.getConstructors().length > 0);
```

### Add/Insert

Add or insert classes to a source file, namespace, or function like declarations by calling `addClass()`, `addClasses()`, `insertClass()`, or `insertClasses()`.

```typescript
const classDeclaration = sourceFile.addClass({
    name: "ClassName"
});
```

### Remove

Call `.remove()`:

```typescript
classDeclaration.remove();
```

### Extends expression

Will return [`ExpressionWithTypeArguments | undefined`](expressions):

```typescript
const extendsExpression = classDeclaration.getExtends();
```

Set the extends expression:

```typescript
classDeclaration.setExtends("BaseClass");
```

Remove it:

```typescript
classDeclaration.removeExtends();
```

### Implements expressions

Will return [`ExpressionWithTypeArguments[]`](expressions):

```typescript
const implementsExpressions = classDeclaration.getImplements();
```

Add or insert implements expressions:

```typescript
classDeclaration.addImplements("Named");
classDeclaration.addImplements(["Named", "Aged"]);
classDeclaration.insertImplements(1, "Named");
classDeclaration.insertImplements(1, ["Named", "Aged"]);
```

Remove an expression:

```typescript
classDeclaration.removeImplements(0); // index
classDeclaration.removeImplements(classDeclaration.getImplements()[0]); // node
```

### Derived Classes

Will return all the class declarations that derive from the current class:

```typescript
const derivedClasses = classDeclaration.getDerivedClasses();
```

### Constructor

Constructors can be retreived via `getConstructors`. This returns all the constructors in an ambient context, but will only return the
implementation constructor otherwise.

```typescript
const constructors = classDeclaration.getConstructors();
```

Add or insert a constructor by calling `addConstructor()` or `insertConstructor()` respectively.

```typescript
const ctor = classDeclaration.addConstructor({ /* options like parameters may go here */ });
```

### Methods

Get instance methods:

```typescript
const instanceMethods = classDeclaration.getInstanceMethods();
const myMethod = classDeclaration.getInstanceMethod("myMethod");
const firstMethodWith2Params = classDeclaration.getInstanceMethod(m => m.getParameters().length === 2);
```

Get the static methods:

```typescript
const staticMethods = classDeclaration.getStaticMethods();
const myStaticMethod = classDeclaration.getStaticMethod("myMethod");
const firstStaticMethodWith2Params = classDeclaration.getStaticMethod(m => m.getParameters().length === 2);
```

#### Add/Insert

Add or insert methods by using `insertMethods()`, `insertMethod`, `addMethod`, or `addMethods`:

```typescript
const method = classDeclaration.addMethod({ isStatic: true, name: "myMethod", returnType: "string" });
```

#### Remove

Call `.remove()`:

```typescript
method.remove();
```

### Properties

Properties searched for can be of type `PropertyDeclaration`, `GetAccessorDeclaration`, `SetAccessorDeclaration`, or `ParameterDeclaration` (constructor parameter properties).

Get the instance properties:

```typescript
const instanceProperties = classDeclaration.getInstanceProperties();
const myProperty = classDeclaration.getInstanceProperty("myProperty");
const myStringProperty = classDeclaration.getInstanceProperty(p =>
    TypeGuards.isPropertyDeclaration(p) && p.getType().getText() === "string");
```

Get the static properties:

```typescript
const staticProperties = classDeclaration.getStaticProperties();
const myStaticProperty = classDeclaration.getStaticProperty("myStaticProperty");
const myStaticStringProperty = classDeclaration.getStaticProperty(p =>
    TypeGuards.isPropertyDeclaration(p) && p.getType().getText() === "string");
```

#### Add/Insert

Add or insert properties by using `insertProperties()`, `insertProperty`, `addProperty`, or `addProperties`:

```typescript
const property = classDeclaration.addProperty({ isStatic: true, name: "prop", type: "string" });
```

Add or insert get accessors by using `insertGetAccessors()`, `insertGetAccessor`, `addGetAccessor`, or `addGetAccessors`:

```typescript
const getAccessor = classDeclaration.addGetAccessor({ name: "someNumber", returnType: "number", body: "return 5;" });
```

Add or insert set accessors by using `insertSetAccessors()`, `insertSetAccessor`, `addSetAccessor`, or `addSetAccessors`:

```typescript
const setAccessor = classDeclaration.addSetAccessor({ name: "someNumber", parameters: [{ name: "value", type: "number" }], body: "_someNumber = value;" });
```

#### Remove

Call `.remove()`:

```typescript
property.remove();
```

### Get members

Get all static and instance members:

```typescript
const allMembers = classDeclaration.getAllMembers();
```

Get instance members:

```typescript
const instanceMembers = classDeclaration.getInstanceMembers();
```

Get static members:

```typescript
const staticMembers = classDeclaration.getStaticMembers();
```

## Abstract

Nodes on a class may be abstract.

Get if it's abstract:

```typescript
method.isAbstract(); // returns: boolean
```

Get the abstract keyword:

```typescript
method.getAbstractKeyword(); // returns: node | undefined
```

Set if abstract:

```typescript
method.setIsAbstract(true);  // set as abstract
method.setIsAbstract(false); // set as not abstract
```

## Constructors

Constructors implement common functions found on function like declarations, but also include a scope.

## Methods

Explore the functionality available via auto-complete.

## Properties

Explore the functionality available via auto-complete.

## Get Accessors

If it exists, get the corresponding set accessor:

```typescript
const setAccessor = getAccessor.getSetAccessor();
```

## Set Accessors

If it exists, get the corresponding get accessor:

```typescript
const getAccessor = setAccessor.getGetAccessor();
```
