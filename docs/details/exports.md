---
title: Export
---

## Export

Certain nodes in TypeScript can be [exported](https://www.typescriptlang.org/docs/handbook/modules.html).

### Is export

Use `isExported()`, `isNamedExport()`, or `isDefaultExport()` methods:

```ts
functionDeclaration.isExported(); // returns: boolean
functionDeclaration.isNamedExport(); // returns: boolean
functionDeclaration.isDefaultExport(); // returns: boolean
```

### `export` and `default` keyword

Use the `has` methods to check for the `export` and `default` keywords:

```ts
functionDeclaration.hasExportKeyword(); // returns: boolean
functionDeclaration.hasDefaultKeyword(); // returns: boolean
```

And use the `get` methods to get the keywords:

```ts
functionDeclaration.getExportKeyword();
functionDeclaration.getDefaultKeyword();
```

### Setting as default export

Use `setIsDefaultExport` to set a node as being a default export or not:

```ts
functionDeclaration.setIsDefaultExport(true); // be one
functionDeclaration.setIsDefaultExport(false); // don't be one
```

Note: This will throw an exception if the node's parent is not a source file.

### Setting as export

Use `setIsExported` to set a node as being a named export if the parent is a source file or an export of a namespace if the parent is a namespace:

```ts
functionDeclaration.setIsExported(true); // be one
functionDeclaration.setIsExported(false); // don't be one
```

## Export Declarations

Export declarations look like this:

```ts
export * from "./some-file";
export {MyClass} from "./other-file";
export {MyClass};
```

Get the export declarations by calling:

```ts
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
exportDeclaration.getModuleSpecifierSourceFile(); // returns: SourceFile | undefined
```

### Add/Insert

Add or insert use `insertExportDeclaration`, `insertExportDeclarations`, `addExportDeclaration`, or `addExportDeclarations`:

```ts
const exportDeclaration = sourceFile.addExportDeclaration({
    defaultImport: "MyClass",
    moduleSpecifier: "./file"
});
```

### Remove

Call `.remove()`:

```ts
exportDeclaration.remove();
```

### To Namespace Export

Given an export declaration with named exports:

```ts
export {Export1, Export2, Export3} from "./other-file";
```

Calling `exportDeclaration.toNamespaceExport();` will change the code to the following:

```ts
export * from "./other-file";
```

### Named Exports

Get the named exports from an export declaration:

```ts
const namedExports = exportDeclaration.getNamedExports();
```

Adding or inserting named exports can be done via the `addNamedExport`, `addNamedExports`, `insertNamedExport`, or `insertNamedExports` methods.

```ts
const namedExport = exportDeclaration.addNamedExport({
    name: "MyClass",
    alias: "MyAliasName" // alias is optional
});
```

Removing one named export:

```ts
namedExport.remove();
```

#### Export specifier

Export specifiers are the individual named exports.

##### Name

```ts
namedExport.getNameNode(); // returns: Identifier
namedExport.setName("NewName");
namedExport.renameName("NewName");
```

##### Alias

```ts
namedExport.getAliasIdentifier(); // returns: Identifier | undefined
namedExport.setAlias("NewAliasName");
```

_Note:_ Setting the alias will rename any uses of the alias or identifier to the new value.

##### Local Target Declarations

The local target declarations are the declarations that the export specifier is referencing:

```ts
const declarations = namedExport.getLocalTargetDeclarations(); // returns: Node[]
```

##### Parent export declaration

```ts
namedExport.getExportDeclaration(); // returns: ExportDeclaration
```

## Export Assignments

Export assignments look like the following:

```ts
export = 5;
export default name;
```

Get the export assignments by calling:

```ts
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

```ts
const exportAssignment = sourceFile.addExportAssignment({
    isExportEquals: true, // defaults to true
    expression: "5"
});
```

### Remove

Call `.remove()`:

```ts
exportAssignment.remove();
```
