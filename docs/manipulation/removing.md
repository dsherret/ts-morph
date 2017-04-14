---
title: Removing
---

## Removing

Given the source file for following code:

```typescript
enum MyEnum {
    myMember
}
```

Removing can be done as follows:

```typescript
const member = sourceFile.getEnum("MyEnum")!.getMember("myMember")!;
member.remove();
```

So the file above would now contain the following code:

```typescript
enum MyEnum {
}
```
