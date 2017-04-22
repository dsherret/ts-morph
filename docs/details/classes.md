---
title: Classes
---

## Class Declarations

Class declarations can be retrieved from source files, namespaces, or function bodies:

```typescript
const classes = sourceFile.getClasses();
const class1 = sourceFile.getClass("Class1");
const class2 = sourceFile.getClass(c => c.getConstructor() !== undefined);
```

### Constructor

If one exists, it can be retrieved via `getConstructor`:

```typescript
classDeclaration.getConstructor();
```

### Methods

Get the instance methods using `getInstanceMethods()`:

```typescript
const instanceMethods = classDeclaration.getInstanceMethods();
```

Get the static methods using `getStaticMethods()`:

```typescript
const staticMethods = classDeclaration.getStaticMethods();
```

### Properties

Get the instance properties using `getInstanceProperties()`:

```typescript
const instanceProperties = classDeclaration.getInstanceProperties();
```

Get the static properties using `getStaticProperties()`:

```typescript
const staticProperties = classDeclaration.getStaticProperties();
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
