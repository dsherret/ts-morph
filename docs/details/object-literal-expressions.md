---
title: Object Literal Expressions
---

## Object Literal Expressions

Object literal expressions look like the [initializer](initializers) for this variable declaration:

```ts
const obj = {
    propertyAssignment: 5,
    shorthandPropertyAssignment,
    ...spreadAssignment,
    get getAccessor() {
        return 5;
    },
    set setAccessor(value: number) {
        // do something
    },
    method() {
        return "some string"
    }
};
```

### Properties

Once you have retrieved the object literal expression, get it's properties via:

```ts
const properties = objectLiteralExpression.getProperties();
// or
const property = objectLiteralExpression.getProperty("propertyAssignment");
// or
const spreadAssignment = objectLiteralExpression.getProperty(
    p => p.getText() === "...spreadAssignment"
);
// or
const method = objectLiteralExpression.getPropertyOrThrow("method");
```

### Property Assignments

Add a property assignment via the `insertPropertyAssignment`, `insertPropertyAssignments`, `addPropertyAssignment`, or `addPropertyAssignments` methods.

```ts
const propertyAssignment = objectLiteralExpression.addPropertyAssignment({
    name: "propertyAssignment",
    initializer: "5"
});
```

### Shorthand Property Assignments

Add a shorthand property assignment via the `insertShorthandPropertyAssignment`, `insertShorthandPropertyAssignments`,
`addShorthandPropertyAssignment`, or `addShorthandPropertyAssignments` methods.

```ts
const shorthandPropertyAssignment = objectLiteralExpression.addShorthandPropertyAssignment({
    name: "shorthandPropertyAssignment"
});
```

### Spread Assignments

Add a spread assignment via the `insertSpreadAssignment`, `insertSpreadAssignments`, `addSpreadAssignment`, or `addSpreadAssignments` methods.

```ts
const spreadAssignment = objectLiteralExpression.addSpreadAssignment({ expression: "spreadAssignment" });
```

### Accessors

Add get and set accessors via the `insertGetAccessor`, `insertGetAccessors`, `addGetAccessor`, `addGetAccessors`, or similarly named methods for set accessors.

```ts
const getAccessor = objectLiteralExpression.addGetAccessor({
    name: "someNumber",
    returnType: "number",
    statements: ["return someNumber;"]
});
const setAccessor = objectLiteralExpression.addSetAccessor({
    name: "someNumber",
    parameters: [{ name: "value", type: "number" }],
    statements: ["someNumber = value;"]
});
```

### Methods

Add a method via the `insertMethod`, `insertMethods`, `addMethod`, or `addMethods` methods.

```ts
const method = objectLiteralExpression.addMethod({
    name: "method",
    statements: [`return "some string";`]
});
```


### Removing

Remove a member by calling `.remove()` on it.

```ts setup: const obj: ObjectLiteralExpression;
obj.getPropertyOrThrow("prop1").remove();
```
