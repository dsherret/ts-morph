---
title: Following Comma
---

## Following Comma

Some nodes may have a comma after them. You can check for that via:

```typescript
enumMember.hasFollowingComma(); // returns: boolean
```

And get it via:

```typescript
enumMember.getFollowingComma(); // returns: node | undefined
```
