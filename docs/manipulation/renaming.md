---
title: Renaming
---

## Renaming

Given the source file for following code:

```typescript
enum MyEnum {
    myMember
}

const myVar = MyEnum.myMember;
```

Renaming can be done as follows:

```typescript
const myEnum = sourceFile.getEnum("MyEnum")!;
myEnum.rename("NewEnum");
```

Which will rename all usages of `MyEnum` to `NewEnum` across _all_ files.

So the file above would now contain the following code:

```typescript
enum NewEnum {
    myMember
}

const myVar = NewEnum.myMember;
```
