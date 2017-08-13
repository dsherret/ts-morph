---
title: Decorators
---

## Decorators

Decorators can be retrieved from class related nodes by calling the `getDecorators()` method.

```typescript
const decorators = classDeclaration.getDecorators();
```

### Name

You can get the name or fully qualified name of a decorator by using the `getName()` or `getFullName()` functions respectively.

For example, given the following code:

```typescript
@obj.decorator
function myFunction() {
}
```

The following happens:

```typescript
decorator.getName(); // decorator
decorator.getFullName(); // obj.decorator
```

### Decorator factory

Decorators with parenthesis (ex. `@decorator(3)`) are decorator factories, while decorators without (ex. `@decorator`) are not.

```typescript
decorator.isDecoratorFactory(); // returns: boolean
```

### Arguments

Decorators with parenthesis are call expressions.

Call expressions are currently not implemented in this library, so you will
need to access the information about it by getting the call expression's underlying compiler node:

```typescript
// must be a decorator factory, otherwise getCallExpression will return undefined
if (!decorators.isDecoratorFactory())
    return;

const callExpression = decorator.getCallExpression()!.compilerNode;
for (const arg of callExpression.arguments) {
    // use arg here
}
```

### Add/Insert decorators

Decorators can be added or inserted by calling `addDecorator(decorator)`, `addDecorators(decorators)`, `insertDecorator(index, decorator)`, or `insertDecorators(index, decorators)`.

For example:

```typescript
classDeclaration.addDecorator({
    name: "MyDecorator",
    arguments: ["3", `"some string"`]
});
```
