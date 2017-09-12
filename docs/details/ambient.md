---
title: Ambient
---

## Ambient

Certain nodes in TypeScript can be ambient. For example, all nodes within a definition file are ambient.

### Testing if ambient

Use `isAmbient()`:

```typescript
classDeclaration.isAmbient(); // returns: boolean
```

This will do several checks to see if it's an ambient declaration.

### `declare` keyword

Check for the `declare` keyword:

```typescript
classDeclaration.hasDeclareKeyword(); // returns: boolean
```

Or get the `declare` keyword if it exists:

```typescript
classDeclaration.getDeclareKeyword();
```

Or toggle the `declare` keyword on and off:

```typescript
classDeclaration.toggleDeclareKeyword(true);
classDeclaration.toggleDeclareKeyword(false);
classDeclaration.toggleDeclareKeyword(); // toggles between true and false
```
