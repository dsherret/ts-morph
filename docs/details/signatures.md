---
title: Signatures
---

## Signatures

### Type Parameters

```ts
const typeParams = signature.getTypeParameters(); // returns: TypeParameter[]
```

### Parameters

```ts
const params = signature.getParameters(); // returns: Symbol[]
```

### Return Type

```ts
const returnType = signature.getReturnType();
```

### Documentation Comments

```ts
const docs = signature.getDocumentationComments();
```

### JS Doc Tags

```ts
const tags = signature.getJsDocTags();
```
