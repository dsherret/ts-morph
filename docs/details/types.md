---
title: Types
---

## Types

Types are accessed by calling `.getType()` on nodes that are typed. For example:

```ts
const type = parameter.getType();
```

There are other ways for accessing a type. For example:

```ts
const returnType = functionDeclaration.getReturnType();
```

### Compiler Type

The underlying compiler type can be accessed via:

```ts
const compilerType = type.compilerType;
```

### Apparent type

Given the following variable declaration:

```ts
const myVar = 4;
```

The type is `4` and the apparent type is `Number`.

Retrieve the apparent type via the following:

```ts
const apparentType = type.getApparentType();
```

### Text

Getting the type text can be achieved by calling `.getText()`:

```ts
const text = type.getText();
```

Sometimes this may not be good enough. If not, try to provide the enclosing node:

```ts
const text = type.getText(parameter);
```

Format it by providing `ts.TypeFormatFlags`:

```ts
const text = type.getText(parameter, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrayAsGenericType);
```

Look at the TypeScript compiler definition file for more available options for `ts.TypeFormatFlags`.

### Intersection types

```ts
const intersectionTypes = type.getIntersectionTypes();
```

### Union types

```ts
const unionTypes = type.getUnionTypes();
```

### Properties

Get the properties or property of a type:

```ts
const properties = type.getProperties();
const prop1 = type.getProperty("prop1");
const prop2 = type.getProperty(p => p.getName() === "prop2");
```

Or the apparent properties:

```ts
const apparentProperties = type.getApparentProperties();
const prop1 = type.getApparentProperty("prop1");
const prop2 = type.getApparentProperty(p => p.getName() === "prop2");
```

### Base types

```ts
const baseTypes = type.getBaseTypes();
```

### Call signatures

```ts
const callSignatures = type.getCallSignatures();
```

### Construct signatures

Get the construct signatures (new signatures) of a type:

```ts
const constructSignatures = type.getConstructSignatures();
```

### Index types

Get either the string index type (ex. for `{ [index: string]: Date; }` it would be `Date`)
or the number index type (ex. for `{ [index: number]: object; }` it would be `object`):

```ts
const stringIndexType = type.getStringIndexType();
const numberIndexType = type.getNumberIndexType();
```

### Non-nullable type

Gets the non-nullable type from a nullable type:

```ts
const nonNullableType = type.getNonNullableType();
```

For example, `string | undefined` would return `string`.

### Type flags

This has information about the type, such as `ts.TypeFlags.BooleanLike`.

```ts
const flags = type.getFlags();
```

Generally a method that starts with "is" exists on the type and you can easily use that instead of checking the flags (same with Object flags below).

### Object flags

This has information about object types, such as `ts.ObjectFlags.Mapped`.

```ts
const objectFlags = type.getObjectFlags();
```

### Symbol

Get the symbol of the type if it exists:

```ts
const typeSymbol = type.getSymbol();
```

### Alias symbol

```ts
const aliasSymbol = type.getAliasSymbol();
```

### Alias type arguments

```ts
const aliasTypeArgs = type.getAliasTypeArguments();
```

### Telling type

Use any of the following methods:

```ts
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

### Removing a Type

Remove a type or a return type from a node:

```ts
propertyDeclaration.removeType();
functionDeclaration.removeReturnType();
```

### TODO

Not implemented. Getting...

* Enum member types
* Destructuring pattern
* More...?
