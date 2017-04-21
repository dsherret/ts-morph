---
title: Enums
---

## Enums

Enums can be retrieved from source files, namespaces, or function bodies by calling `getEnums()`:

```typescript
const enums = sourceFile.getEnums();
```

### Adding

You can add enums to a source file or namespace by calling `addEnum()`:

```typescript
const enumDeclaration = sourceFile.addEnum({
    name: "EnumName",
    members: [{
        name: "member"
    }]
});
```

### Add member

Members can be added by calling `addMember()`:

```typescript
const member = enumDeclaration.addMember({
    name: "newMember",
    value: 10
});
```

### Get all members

Use `getMembers()`:

```typescript
const members = enumDeclaration.getMembers();
```

### Get member

Use `getMember()`:

```typescript
const member1 = enumDeclaration.getMember("member1");
const member2 = enumDeclaration.getMember(m => m.getValue() === 1);
```

### Const enum

Check if it's a const enum via `isConstEnum()`:

```typescript
enumDeclaration.isConstEnum(); // returns: boolean
```

Get the `const` keyword via `getConstKeyword()`:

```typescript
enumDeclaration.getConstKeyword(); // returns: Node | undefined
```

Set if it's a const enum via `setIsConstEnum(value)`:

```typescript
enumDeclaration.setIsConstEnum(true);
enumDeclaration.setIsConstEnum(false);
```
