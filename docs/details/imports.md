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

#### Setting Example

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

### Get namespace import

```typescript
const namespaceImport = importDeclaration.getNamespaceImport(); // returns: Identifier | undefined
```

### Get named imports

```typescript
const namedImports = importDeclaration.getNamedImports();

// then get the information about the named import:
namedImports[0].getIdentifier();
namedImports[0].getAliasIdentifier();
```
