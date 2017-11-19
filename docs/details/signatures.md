---
title: Signatures
---

## Signatures

### Type Parameters

```typescript
const typeParams = signature.getTypeParameters(); // returns: TypeParameter[]
```

### Parameters

```typescript
const params = signature.getParameters(); // returns: Symbol[]
```

### Return Type

```typescript
const returnType = signature.getReturnType();
```

### Documentation Comments

```typescript
const docs = signature.getDocumentationComments();
```

### JS Doc Tags

```typescript
const tags = signature.getJsDocTags();
```
