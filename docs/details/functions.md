---
title: Functions
---

## Functions

Functions can be retrieved from source files, other namespaces, or function bodies:

```typescript
const functions = sourceFile.getFunctions();
const function1 = sourceFile.getFunction("Function1");
const firstFunctionWithChildFunction = sourceFile.getFunction(f => f.getFunctions().length > 0);
```

Most of the information you can get about functions is covered in other sections.

### Add/Insert

You can add or insert enums to a source file, namespace, or function like declarations by calling `addFunction()`, `addFunctions()`, `insertFunction()`, or `insertFunctions()`.

```typescript
const functionDeclaration = sourceFile.addFunction({
    name: "FunctionName"
});
```

### Remove

Call `.remove()`:

```typescript
functionDeclaration.remove();
```

### Overloads

By default, in ambient contexts or for ambient nodes, all overloads will be returned. In non-ambient contexts, only the implementation will be returned.

You can get the overloads by calling:

```typescript
const overloads = functionDeclaration.getOverloads(); // returns: FunctionDeclaration[]
```

Or tell if the current declaration is an overload by calling either:

```typescript
functionDeclaration.isOverload();
functionDeclaration.isImplementation();
```

From the overloads, you can get the implementation by calling:

```typescript
const implementation = overload.getImplementation();
```

#### Add/Insert

You can add or insert overloads by using either the `.addOverload()`, `.addOverloads()`, `.insertOverload()`, or `insertOverloads()` methods.

#### Remove

Call `.remove()` on the overload:

```typescript
overload.remove();
```

### Set body text

The body text can be set via the `.setBodyText()` method:

```typescript
functionDeclaration.setBodyText("const myNumber = 5;");
```
