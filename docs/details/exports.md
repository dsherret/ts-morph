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


## Export Declarations

Export declarations look like this:

```typescript
export * from "./some-file";
export {MyClass} from "./other-file";
export {MyClass};
```

You can get the export declarations by calling:

```typescript
const exports = sourceFile.getExports();
// or to get the first one that matches a condition
const exportDeclaration = sourceFile.getExport(d => d.hasNamedExports());

// tell if it has named exports
exportDeclaration.hasNamedExports();
// or if it's a namespace export
exportDeclaration.isNamespaceExport();
// get/set the module specifier
exportDeclaration.getModuleSpecifier(); // returns: string | undefined
exportDeclaration.setModuleSpecifier("./new-file");
exportDeclaration.hasModuleSpecifier(); // returns: boolean
```

### Named Exports

Get the named exports from an export declaration:

```typescript
const namedExports = exportDeclaration.getNamedExports();
```

#### Export specifier

Export specifiers are the individual named exports.

##### Name

```typescript
namedExport.getName(); // returns: Identifier
namedExport.setName("NewName");
namedExport.renameName("NewName");
```

##### Alias

```typescript
namedExport.getAlias(); // returns: Identifier | undefined
namedExport.setAlias("NewAliasName");
```

_Note:_ Setting the alias will rename any uses of the alias or identifier to the new value.

##### Parent export declaration

```typescript
namedExport.getExportDeclaration(); // returns: ExportDeclaration
```
