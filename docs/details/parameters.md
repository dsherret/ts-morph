---
title: Parameters
---

## Parameters

Parameters can be retreived from nodes by calling `getParameters()`:

```ts
const parameters = functionDeclaration.getParameters();
```

### Inserting/Adding

Insert or add rest parameters by calling `insertParameter()`, `insertParameters()`, `addParameter()`, or `addParameters()`.

For example:

```ts
const parameter = functionDeclaration.insertParameter(1, {
    name: "param1",
    type: "string"
});
```

### Removing

Remove a parameter by calling `.remove()` on it:

```ts
parameter.remove();
```

### Rest parameter

Tell if a parameter is a rest parameter:

```ts
const isRestParameter = parameter.isRestParameter(); // returns: boolean
```

Or set a parameter as a rest parameter:

```ts
parameter.setIsRestParameter(true);
```

### Parameter Property

Constructor parameters may be properties when they have a scope and/or are readonly. You can tell if one is by calling:

```ts
const isParameterProperty = parameter.isParameterProperty(); // returns: boolean
```

### Optional

A parameter can be optional if it is marked so with a question mark, is a rest parameter, or has an initializer.

`isOptional()` can be used to tell if any of these are true:

```ts
const isOptional = parameter.isOptional(); // returns: boolean
```
