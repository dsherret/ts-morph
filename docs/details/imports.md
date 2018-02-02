---
title: Imports
---

## Imports

Imports of a source file can be retrieved by calling:

```ts
// get them all
const imports = sourceFile.getImportDeclarations();
// or get the first one that matches a condition
const importWithDefaultImport = sourceFile.getImport(i => i.getDefaultImport() != null);
```

### Add/Insert

Add or insert use `insertImportDeclaration`, `insertImportDeclarations`, `addImportDeclaration`, or `addImportDeclarations`:

```ts
const importDeclaration = sourceFile.addImportDeclaration({
    defaultImport: "MyClass",
    moduleSpecifier: "./file"
});
```

### Remove

Call `.remove()`:

```ts
importDeclaration.remove();
```

### Module specifier

Get it:

```ts
const moduleSpecifier = importDeclaration.getModuleSpecifier(); // returns: string
```

_Example:_ For `import settings from "./settings";` would return `./settings`.

Set it:

```ts
importDeclaration.setModuleSpecifier("./new-file");
```

Get the referenced source file:

```ts
const sourceFile = importDeclaration.getModuleSpecifierSourceFile(); // returns: SourceFile | undefined
```

### Default import

Get it:

```ts
const defaultImport = importDeclaration.getDefaultImport(); // returns: Identifier | undefined
```

Set it:

```ts
importDeclaration.setDefaultImport("MyClass");
```

#### Example

Given the file:

```ts
import MyClass from "./file";

const instance = new MyClass();
```

Doing the following:

```ts
const importDeclaration = sourceFile.getImportDeclarations()[0];
importDeclaration.setDefaultImport("NewName");
````

Will rename the default import and all its usages:

```ts
import NewName from "./file";

const instance = new NewName();
```

### Namespace import

Get it:

```ts
const namespaceImport = importDeclaration.getNamespaceImport(); // returns: Identifier | undefined
```

Set it:

```ts
importDeclaration.setNamespaceImport("newName");
```

_Note:_ Setting the namespace import for an existing namespace import will rename any uses of the namespace import in the current file.

### Named imports

Getting a named import:

```ts
const namedImports = importDeclaration.getNamedImports(); // returns: ImportSpecifier
```

Adding or inserting named imports can be done via the `addNamedImport`, `addNamedImports`, `insertNamedImport`, or `insertNamedImports` methods.

```ts
const namedImport = importDeclaration.addNamedImport({
    name: "MyClass",
    alias: "MyAliasName" // alias is optional
});
```

Removing one named import:

```ts
namedImport.remove();
```

Removing all named imports:

```ts
importDeclaration.removeNamedImports();
```

#### Import specifier

Import specifiers are the individual named imports.

##### Name

```ts
namedImport.getNameNode(); // returns: Identifier
namedImport.setName("NewName");
namedImport.renameName("NewName");
```

##### Alias

```ts
namedImport.getAliasIdentifier(); // returns: Identifier | undefined
namedImport.setAlias("NewAliasName");
```

_Note:_ Setting the alias will rename any uses of the alias or identifier in the current file to the new value.

##### Parent import declaration

```ts
namedImport.getImportDeclaration(); // returns: ImportDeclaration
```
