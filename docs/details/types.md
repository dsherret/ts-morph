---
title: Types
---

## Types

Types are accessed by calling `.getType()` on nodes that are typed. For example:

```typescript
const type = parameter.getType();
```

There are other ways for accessing a type. For example:

```typescript
const returnType = functionDeclaration.getReturnType();
```

### Compiler Type

The underlying compiler type can be accessed via:

```typescript
const compilerType = type.getCompilerType();
```

### Text

Getting the type text can be achieved by calling `.getText()`:

```typescript
const text = type.getText();
```

Sometimes this may not be good enough. If not, you can also provide the enclosing node:

```typescript
const text = type.getText(parameter);
```

And you can format it by providing `ts.TypeFormatFlags`:

```typescript
const text = type.getText(parameter, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrayAsGenericType);
```

Look at the TypeScript compiler definition file for more available options for `ts.TypeFormatFlags`.

### Properties

Get the properties of the type:

```typescript
const properties = type.getProperties();
```

### Intersection types

Get the intersection types of the type:

```typescript
const intersectionTypes = type.getIntersectionTypes();
```

### Union types

Get the union types of the type:

```typescript
const unionTypes = type.getUnionTypes();
```

### Type flags

This has information about the type, such as `ts.TypeFlags.BooleanLike`.

```typescript
const flags = type.getFlags();
```

Generally a method that starts with "is" exists on the type and you can easily use that instead of checking the flags (same with Object flags below).

### Object flags

This has information about object types, such as `ts.ObjectFlags.Mapped`.

```typescript
const objectFlags = type.getObjectFlags();
```

### Telling type

Use any of the following methods:

```typescript
type.isAnonymousType();
type.isBooleanType();
type.isEnumType();
type.isIntersectionType();
type.isInterfaceType();
type.isObjectType();
type.isTupleType();
type.isUnionType();
```

If you see something that doesn't exist here and should (there's a lot missing), then please log an issue or submit a pull request.

### TODO

Not implemented. Getting...

* Number index type
* String index type
* Construct signatures
* Call signatures
* Apparent properties
* One property
* Non-nullable type
* Base Types
* Enum member types
* Symbol
* Destructuring pattern
* Alias Symbol
* Alias type arguments