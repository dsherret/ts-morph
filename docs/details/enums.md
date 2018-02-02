---
title: Enums
---

## Enums

Enums can be retrieved from source files, namespaces, or function bodies:

```ts
const enums = sourceFile.getEnums();
const enum1 = sourceFile.getEnum("Enum1");
const enum2 = sourceFile.getEnum(e => e.getMembers().length === 5);
```

### Add/Insert

Add or insert enums to a source file, namespace, or function like declarations by calling `addEnum()`, `addEnums()`, `insertEnum()`, or `insertEnums()`.

```ts
const enumDeclaration = sourceFile.addEnum({
    name: "EnumName",
    members: [{
        name: "member"
    }]
});
```

### Remove

Call `.remove()`:

```ts
enumDeclaration.remove();
```

### Get all members

Use `getMembers()`:

```ts
const members = enumDeclaration.getMembers();
```

### Get member

Use `getMember()`:

```ts
const member1 = enumDeclaration.getMember("member1");
const member2 = enumDeclaration.getMember(m => m.getValue() === 1);
```

### Add/Insert member

Members can be added by calling `addMember()`, `addMembers()`, `insertMember()`, or `insertMembers()`:

```ts
const member = enumDeclaration.addMember({
    name: "newMember",
    value: 10
});
```

### Const enum

Check if it's a const enum via `isConstEnum()`:

```ts
enumDeclaration.isConstEnum(); // returns: boolean
```

Get the `const` keyword via `getConstKeyword()`:

```ts
enumDeclaration.getConstKeyword(); // returns: Node | undefined
```

Set if it's a const enum via `setIsConstEnum(value)`:

```ts
enumDeclaration.setIsConstEnum(true);
enumDeclaration.setIsConstEnum(false);
```

## Enum Members

```ts
const member = enumDeclaration.getMember("member");
```

### Value

The value can be retrieved whether it is implicitly or explicitly defined:

```ts
member.getValue(); // returns: string | number
```

It can also be set to a number:

```ts
member.setValue(5);
```

Or a string:

```ts
member.setValue("string value");
```

### Removing

Call `remove()` on it:

```ts
member.remove();
```
