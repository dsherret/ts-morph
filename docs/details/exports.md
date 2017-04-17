---
title: Export
---

## Export

Certain nodes in TypeScript can be [exported](https://www.typescriptlang.org/docs/handbook/modules.html).

### Is export

Use the `isNamedExport()` and `isDefaultExport()` methods:

```typescript
functionDeclaration.isNamedExport(); // returns: boolean
functionDeclaration.isDefaultExport(); // returns: boolean
```

### `export` and `default` keyword

Use the `has` methods to check for the `export` and `default` keywords:

```typescript
functionDeclaration.hasExportKeyword(); // returns: boolean
functionDeclaration.hasDefaultKeyword(); // returns: boolean
```

And use the `get` methods to get the keywords:

```typescript
functionDeclaration.getExportKeyword();
functionDeclaration.getDefaultKeyword();
```

### Setting as default export

Use `setIsDefaultExport` to set a node as being a default export or not:

```typescript
functionDeclaration.setIsDefaultExport(true); // be one
functionDeclaration.setIsDefaultExport(false); // don't be one
```

Note: This will throw an exception if the node's parent is not a source file.

### Setting as export

Use `setIsExported` to set a node as being a named export if the parent is a source file or an export of a namespace if the parent is a namespace:

```typescript
functionDeclaration.setIsExported(true); // be one
functionDeclaration.setIsExported(false); // don't be one
```
