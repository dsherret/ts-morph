---
title: Parameters
---

## Parameters

Parameters can be retreived from nodes like functions by calling `getParameters()`:

```typescript
const parameters = functionDeclaration.getParameters();
```

### Inserting/Adding

You can insert or add rest parameters by calling `insertParameter()`, `insertParameters()`, `addParameter()`, or `addParameters()`:

For example:

```typescript
const parameter = functionDeclaration.insertParameter(1, {
    name: "param1",
    type: "string"
});
```

### Rest parameter

You can tell if a parameter is a rest parameter:

```typescript
const isRestParameter = parameter.isRestParameter(); // returns: boolean
```

Or set a parameter as a rest parameter:

```typescript
parameter.setIsRestParameter(true);
```

### Optional

A parameter can be optional if it is marked so with a question mark, is a rest parameter, or has an initializer.

`isOptional()` can be used to tell if any of these are true:

```typescript
const isOptional = parameter.isOptional(); // returns: boolean
```
