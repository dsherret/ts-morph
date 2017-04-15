---
title: JS Docs
---

## JS Docs

Certain nodes in TypeScript can have JS docs. For example:

```typescript
/**
 * Gets the name.
 */
function getName() {
    // ...
}
```

### Get string

Use `getDocumentationComment()` to return all the documentation comments separated by new lines as a string:

```typescript
functionDeclaration.getDocumentationComment(); // returns: string | undefined
```

This will return `undefined` if no documentation comment exists.

### Get all documentation comment nodes

You can get all the documentation comment nodes by using `getDocumentationCommentNodes()`:

```typescript
functionDeclaration.getDocumentationCommentNodes(); // returns: JSDoc[]
```
