---
title: Type Aliases
---

## Type Aliases

Type aliases can be retrieved from source files, namespaces, or function bodies:

```typescript
const typeAliases = sourceFile.getTypeAliases();
const typeAlias = sourceFile.getTypeAlias("TypeAlias");
const firstExportedTypeAlias = sourceFile.getTypeAlias(a => a.hasExportKeyword());
```

Most of the information you can get about type aliases is covered in other sections.
