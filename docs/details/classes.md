---
title: Classes
---

## Class Declarations

Class declarations can be retrieved from source files, namespaces, or function bodies:

```ts
const classes = sourceFile.getClasses();
const class1 = sourceFile.getClass("Class1");
const firstClassWithConstructor = sourceFile.getClass(c => c.getConstructors().length > 0);
```

### Add/Insert

Add or insert classes to a source file, namespace, or function like declarations by calling `addClass()`, `addClasses()`, `insertClass()`, or `insertClasses()`.

```ts
const classDeclaration = sourceFile.addClass({
    name: "ClassName"
});
```

### Remove

Call `.remove()`:

```ts
classDeclaration.remove();
```

### Extends expression

Will return [`ExpressionWithTypeArguments | undefined`](expressions):

```ts
const extendsExpression = classDeclaration.getExtends();
```

Set the extends expression:

```ts
classDeclaration.setExtends("BaseClass");
```

Remove it:

```ts
classDeclaration.removeExtends();
```

### Implements expressions

Will return [`ExpressionWithTypeArguments[]`](expressions):

```ts
const implementsExpressions = classDeclaration.getImplements();
```

Add or insert implements expressions:

```ts
classDeclaration.addImplements("Named");
classDeclaration.addImplements(["Named", "Aged"]);
classDeclaration.insertImplements(1, "Named");
classDeclaration.insertImplements(1, ["Named", "Aged"]);
```

Remove an expression:

```ts
classDeclaration.removeImplements(0); // index
classDeclaration.removeImplements(classDeclaration.getImplements()[0]); // node
```

### Base Types

Get the base types:

```ts
const baseTypes = classDeclaration.getBaseTypes(); // returns: Type[]
```

This is useful to use if you don't know if the class could possibly extend a mixin or a class.

### Base Class

Get the base class:

```ts
const baseClass = classDeclaration.getBaseClass(); // returns: ClassDeclaration | undefined
```

Note: This is not a useful method to use if the base could possibly be a mixin. If you expect mixins, then use `.getBaseTypes()`.

### Derived Classes

Will return all the class declarations that derive from the current class:

```ts
const derivedClasses = classDeclaration.getDerivedClasses();
```

### Constructor

Constructors can be retreived via `getConstructors`. This returns all the constructors in an ambient context, but will only return the
implementation constructor otherwise.

```ts
const constructors = classDeclaration.getConstructors();
```

Add or insert a constructor by calling `addConstructor()` or `insertConstructor()` respectively.

```ts
const ctor = classDeclaration.addConstructor({ /* options like parameters may go here */ });
```

### Methods

Get instance methods:

```ts
const instanceMethods = classDeclaration.getInstanceMethods();
const myMethod = classDeclaration.getInstanceMethod("myMethod");
const firstMethodWith2Params = classDeclaration.getInstanceMethod(m => m.getParameters().length === 2);
```

Get the static methods:

```ts
const staticMethods = classDeclaration.getStaticMethods();
const myStaticMethod = classDeclaration.getStaticMethod("myMethod");
const firstStaticMethodWith2Params = classDeclaration.getStaticMethod(m => m.getParameters().length === 2);
```

#### Add/Insert

Add or insert methods by using `insertMethods()`, `insertMethod`, `addMethod`, or `addMethods`:

```ts
const method = classDeclaration.addMethod({ isStatic: true, name: "myMethod", returnType: "string" });
```

#### Remove

Call `.remove()`:

```ts
method.remove();
```

### Properties

Properties searched for can be of type `PropertyDeclaration`, `GetAccessorDeclaration`, `SetAccessorDeclaration`, or `ParameterDeclaration` (constructor parameter properties).

Get the instance properties:

```ts
const instanceProperties = classDeclaration.getInstanceProperties();
const myProperty = classDeclaration.getInstanceProperty("myProperty");
const myStringProperty = classDeclaration.getInstanceProperty(p =>
    TypeGuards.isPropertyDeclaration(p) && p.getType().getText() === "string");
```

Get the static properties:

```ts
const staticProperties = classDeclaration.getStaticProperties();
const myStaticProperty = classDeclaration.getStaticProperty("myStaticProperty");
const myStaticStringProperty = classDeclaration.getStaticProperty(p =>
    TypeGuards.isPropertyDeclaration(p) && p.getType().getText() === "string");
```

#### Add/Insert

Add or insert properties by using `insertProperties()`, `insertProperty`, `addProperty`, or `addProperties`:

```ts
const property = classDeclaration.addProperty({ isStatic: true, name: "prop", type: "string" });
```

Add or insert get accessors by using `insertGetAccessors()`, `insertGetAccessor`, `addGetAccessor`, or `addGetAccessors`:

```ts
const getAccessor = classDeclaration.addGetAccessor({ name: "someNumber", returnType: "number", body: "return 5;" });
```

Add or insert set accessors by using `insertSetAccessors()`, `insertSetAccessor`, `addSetAccessor`, or `addSetAccessors`:

```ts
const setAccessor = classDeclaration.addSetAccessor({ name: "someNumber", parameters: [{ name: "value", type: "number" }], body: "_someNumber = value;" });
```

#### Remove

Call `.remove()`:

```ts
property.remove();
```

### Get members

Get all static and instance members:

```ts
const allMembers = classDeclaration.getAllMembers();
```

Get instance members:

```ts
const instanceMembers = classDeclaration.getInstanceMembers();
```

Get static members:

```ts
const staticMembers = classDeclaration.getStaticMembers();
```

## Abstract

Nodes on a class may be abstract.

Get if it's abstract:

```ts
method.isAbstract(); // returns: boolean
```

Get the abstract keyword:

```ts
method.getAbstractKeyword(); // returns: node | undefined
```

Set if abstract:

```ts
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

```ts
const setAccessor = getAccessor.getSetAccessor();
```

## Set Accessors

If it exists, get the corresponding get accessor:

```ts
const getAccessor = setAccessor.getGetAccessor();
```
