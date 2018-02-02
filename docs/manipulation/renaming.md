---
title: Renaming
---

## Renaming

Given the source file for following code:

```ts
enum MyEnum {
    myMember
}

const myVar = MyEnum.myMember;
```

Renaming can be done as follows:

```ts
const myEnum = sourceFile.getEnum("MyEnum")!;
myEnum.rename("NewEnum");
```

Which will rename all usages of `MyEnum` to `NewEnum` across _all_ files.

So the file above would now contain the following code:

```ts
enum NewEnum {
    myMember
}

const myVar = NewEnum.myMember;
```
