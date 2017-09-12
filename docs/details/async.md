---
title: Async
---

## Async

Certain nodes in TypeScript can have an `async` keyword modifier.

### Is async

A node can be tested if it's async using the `isAsync()` method:

```typescript
functionDeclaration.isAsync(); // returns: boolean
```

### `async` keyword

Get the `async` keyword if it exists:

```typescript
functionDeclaration.getAsyncKeyword();
```

### Set async

Set if the declaration is async using `setIsAsync`:

```typescript
functionDeclaration.setIsAsync(true);
```
