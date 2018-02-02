---
title: Generators
---

## Generators

Nodes like `FunctionDeclaration` and `MethodDeclaration` can be generators.

### Tell if a generator

```ts
functionDeclaration.isGenerator(); // returns: boolean
```

### Set as a generator

```ts
functionDeclaration.setIsGenerator(true); // or false to set as not one
```

### Get asterisk token (`*`)

Gets the asterisk token or undefined if not exists:

```ts
functionDeclaration.getAsteriskToken();
```
