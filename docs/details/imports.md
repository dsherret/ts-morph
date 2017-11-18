---
title: Imports
---

## Imports

Imports of a source file can be retrieved by calling:

```typescript
// get them all
const imports = sourceFile.getImports();
// or get the first one that matches a condition
const importWithDefaultImport = sourceFile.getImport(i => i.getDefaultImport() != null);
```

### Add/Insert

Add or insert use `insertImport`, `insertImports`, `addImport`, or `addImports`:

```typescript
const importDeclaration = sourceFile.addImport({
    defaultImport: "MyClass",
    moduleSpecifier: "./file"
});
```

### Remove

Call `.remove()`:

```typescript
importDeclaration.remove();
```

### Module specifier

Get it:

```typescript
const moduleSpecifier = importDeclaration.getModuleSpecifier(); // returns: string
```

_Example:_ For `import settings from "./settings";` would return `./settings`.

Set it:

```typescript
importDeclaration.setModuleSpecifier("./new-file");
```

### Default import

Get it:

```typescript
const defaultImport = importDeclaration.getDefaultImport(); // returns: Identifier | undefined
```

Set it:

```typescript
importDeclaration.setDefaultImport("MyClass");
```

#### Example

Given the file:

```typescript
import MyClass from "./file";

const instance = new MyClass();
```

Doing the following:

```typescript
const importDeclaration = sourceFile.getImports()[0];
importDeclaration.setDefaultImport("NewName");
````

Will rename the default import and all its usages:

```typescript
import NewName from "./file";

const instance = new NewName();
```

### Namespace import

Get it:

```typescript
const namespaceImport = importDeclaration.getNamespaceImport(); // returns: Identifier | undefined
```

Set it:

```typescript
importDeclaration.setNamespaceImport("newName");
```

_Note:_ Setting the namespace import for an existing namespace import will rename any uses of the namespace import in the current file.

### Named imports

Getting a named import:

```typescript
const namedImports = importDeclaration.getNamedImports(); // returns: ImportSpecifier
```

Adding or inserting named imports can be done via the `addNamedImport`, `addNamedImports`, `insertNamedImport`, or `insertNamedImports` methods.

```typescript
const namedImport = importDeclaration.addNamedImport({
    name: "MyClass",
    alias: "MyAliasName" // alias is optional
});
```

Removing one named import:

```typescript
namedImport.remove();
```

Removing all named imports:

```typescript
importDeclaration.removeNamedImports();
```

#### Import specifier

Import specifiers are the individual named imports.

##### Name

```typescript
namedImport.getNameNode(); // returns: Identifier
namedImport.setName("NewName");
namedImport.renameName("NewName");
```

##### Alias

```typescript
namedImport.getAliasIdentifier(); // returns: Identifier | undefined
namedImport.setAlias("NewAliasName");
```

_Note:_ Setting the alias will rename any uses of the alias or identifier in the current file to the new value.

##### Parent import declaration

```typescript
namedImport.getImportDeclaration(); // returns: ImportDeclaration
```
