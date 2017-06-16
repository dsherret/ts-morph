---
title: Imports
---

## Imports

Imports of a source file can be retrieved by calling:

```typescript
// get them all
const imports = sourceFile.getImports();
// or filter by a condition
const importsWithDefaultImport = sourceFile.getImports(importDeclaration => importDeclaration.getDefaultImport() != null);
```

### Get module specifier

```typescript
const moduleSpecifier = importDeclaration.getModuleSpecifier(); // returns: string
```

For `import settings from "./settings";` would return `./settings`.

### Get default import

```typescript
const defaultImport = importDeclaration.getDefaultImport(); // returns: Identifier | undefined
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
