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

You can add or insert enums to a source file or namespace by calling `addFunction()`, `addFunctions()`, `insertFunction()`, or `insertFunctions()`.

```typescript
const functionDeclaration = sourceFile.addFunction({
    name: "FunctionName"
});
```
