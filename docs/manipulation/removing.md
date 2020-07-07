---
title: Removing
---

## Removing

Given the source file for following code:

```ts
enum MyEnum {
    myMember,
}
```

Removing can be done as follows:

```ts
const member = sourceFile.getEnum("MyEnum")!.getMember("myMember")!;
member.remove();
```

So the file above would now contain the following code:

```ts
enum MyEnum {
}
```

### Support

Currently removing is implemented individually for each kind of node. In general this will work for many kind of nodes, including methods, properties, constructors, parmeters, statements, declarations. Nevertheless, if you find that `remove()` method is not implemented for a particular kind of Node, please open an issue on github.
