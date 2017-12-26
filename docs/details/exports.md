---
title: Export
---

## Export

Certain nodes in TypeScript can be [exported](https://www.typescriptlang.org/docs/handbook/modules.html).

### Is export

Use `isExported()`, `isNamedExport()`, or `isDefaultExport()` methods:

```typescript
functionDeclaration.isExported(); // returns: boolean
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

Get the export declarations by calling:

```typescript
const exports = sourceFile.getExportDeclarations();
// or to get the first one that matches a condition
const exportDeclaration = sourceFile.getExportDeclaration(d => d.hasNamedExports());

// tell if it has named exports
exportDeclaration.hasNamedExports();
// or if it's a namespace export
exportDeclaration.isNamespaceExport();
// get/set the module specifier
exportDeclaration.getModuleSpecifier(); // returns: string | undefined
exportDeclaration.setModuleSpecifier("./new-file");
exportDeclaration.hasModuleSpecifier(); // returns: boolean
```

### Add/Insert

Add or insert use `insertExportDeclaration`, `insertExportDeclarations`, `addExportDeclaration`, or `addExportDeclarations`:

```typescript
const exportDeclaration = sourceFile.addExportDeclaration({
    defaultImport: "MyClass",
    moduleSpecifier: "./file"
});
```

### Remove

Call `.remove()`:

```typescript
exportDeclaration.remove();
```

### To Namespace Export

Given an export declaration with named exports:

```typescript
export {Export1, Export2, Export3} from "./other-file";
```

Calling `exportDeclaration.toNamespaceExport();` will change the code to the following:

```typescript
export * from "./other-file";
```

### Named Exports

Get the named exports from an export declaration:

```typescript
const namedExports = exportDeclaration.getNamedExports();
```

Adding or inserting named exports can be done via the `addNamedExport`, `addNamedExports`, `insertNamedExport`, or `insertNamedExports` methods.

```typescript
const namedExport = exportDeclaration.addNamedExport({
    name: "MyClass",
    alias: "MyAliasName" // alias is optional
});
```

Removing one named export:

```typescript
namedExport.remove();
```

#### Export specifier

Export specifiers are the individual named exports.

##### Name

```typescript
namedExport.getNameNode(); // returns: Identifier
namedExport.setName("NewName");
namedExport.renameName("NewName");
```

##### Alias

```typescript
namedExport.getAliasIdentifier(); // returns: Identifier | undefined
namedExport.setAlias("NewAliasName");
```

_Note:_ Setting the alias will rename any uses of the alias or identifier to the new value.

##### Parent export declaration

```typescript
namedExport.getExportDeclaration(); // returns: ExportDeclaration
```

## Export Assignments

Export assignments look like the following:

```typescript
export = 5;
export default name;
```

Get the export assignments by calling:

```typescript
const exportAssignments = sourceFile.getExportAssignments();
// or to get the first one that matches a condition
const exportAssignment = sourceFile.getExportAssignment(d => d.isExportEquals());

// get if it's `export =` or `export default`
const isExportEquals = exportAssignment.isExportEquals();
// get the expression
const expression = exportAssignment.getExpression();
```

### Add/Insert

Add or insert use `insertExportAssignment`, `insertExportAssignments`, `addExportAssignment`, or `addExportAssignments`:

```typescript
const exportAssignment = sourceFile.addExportAssignment({
    isExportEquals: true, // defaults to true
    expression: "5"
});
```

### Remove

Call `.remove()`:

```typescript
exportAssignment.remove();
```
