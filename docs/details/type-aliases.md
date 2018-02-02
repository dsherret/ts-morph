---
title: Type Aliases
---

## Type Aliases

Type aliases can be retrieved from source files, namespaces, or function bodies:

```ts
const typeAliases = sourceFile.getTypeAliases();
const typeAlias = sourceFile.getTypeAlias("TypeAlias");
const firstExportedTypeAlias = sourceFile.getTypeAlias(a => a.hasExportKeyword());
```

Most of the information you can get about type aliases is covered in other sections.

### Add/Insert

Add or insert type aliases to a source file, namespace, or function like declarations by calling `addTypeAlias()`, `addTypeAliases()`, `insertTypeAlias()`, or `insertTypeAliases()`.

```ts
const typeAliasDeclaration = sourceFile.addTypeAlias({
    name: "TypeAliasName"
});
```

### Remove

Call `.remove()`:

```ts
typeAliasDeclaration.remove();
```
