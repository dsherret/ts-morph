---
title: Modifiers
---

## Modifiers

Modifiers are nodes that modify other nodes. For example, the `private` keyword is a modifier that changes the scope of a method on a class.

Only certain nodes can have modifiers and they will have these functions.

### Getting all modifiers

```ts
functionDeclaration.getModifiers();
```

### Getting first modifier by syntax kind

Use `getFirstModifierByKind(syntaxKind: ts.SyntaxKind);` where `ts.SyntaxKind` is a TypeScript compiler syntax kind.

```ts
functionDeclaration.getFirstModifierByKind(ts.SyntaxKind.AsyncKeyword);
```

### Telling if has a modifier

```ts
functionDeclaration.hasModifier(ts.SyntaxKind.AsyncKeyword); // returns: boolean
```

### Toggle modifier

Toggles a modifier on or off:

```ts
functionDeclaration.toggleModifier("async");
functionDeclaration.toggleModifier("async", false); // or explicit toggle
```
