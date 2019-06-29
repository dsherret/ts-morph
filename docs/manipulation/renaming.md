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

### Renaming in comments and strings

Set the `renameInComments` and `renameInStrings` options to `true` (they are `false` by default):

```ts setup: let myEnum: EnumDeclaration;
myEnum.rename("SomeOtherName", {
    renameInComments: true,
    renameInStrings: true
});
```

### Renaming with prefix and suffix text

**Note:** This feature is only supported when using TypeScript 3.4+

By default, renames will not change shorthand property assignments or add aliases to import & export specifiers.

For example, renaming the `a` variable declaration to `b`...

```ts
const a = 5;
const x = { a };

export { a };
```

...will do the following:

```ts
const b = 5;
const x = { b };

export { b };
```

This behaviour can be changed by enabling the `usePrefixAndSuffixText` setting, which will do the following:

```ts
const b = 5;
const x = { a: b };

export { b as a };
```

This behaviour change can be specified when renaming:

```ts setup: let varA: VariableDeclaration;
varA.rename("SomeOtherName", {
    usePrefixAndSuffixText: true
});
```

Or globally:

```ts
const project = new Project({
    manipulationSettings: {
        usePrefixAndSuffixTextForRename: true
    }
});
// or
project.manipulationSettings.set({
    usePrefixAndSuffixTextForRename: true
});
```

### Renaming Files or Directories

See:

* [Moving Files](../details/source-files#move)
* [Moving Directories](../navigation/directories#moving)
