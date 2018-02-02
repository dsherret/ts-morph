---
title: Decorators
---

## Decorators

Decorators can be retrieved from class related nodes by calling the `getDecorators()` method.

```ts
const decorators = classDeclaration.getDecorators();
```

### Name

Get the name or fully qualified name of a decorator by using the `getName()` or `getFullName()` functions respectively.

For example, given the following code:

```ts
@obj.decorator
function myFunction() {
}
```

The following happens:

```ts
decorator.getName(); // "decorator"
decorator.getFullName(); // "obj.decorator"
```

### Decorator factory

Decorators with parenthesis (ex. `@decorator(3)`) are decorator factories, while decorators without (ex. `@decorator`) are not.

```ts
decorator.isDecoratorFactory(); // returns: boolean
```

Set as a decorator factory or not:

```ts
decorator.setIsDecoratorFactory(true);
```

### Arguments

Get the decorator's arguments by calling `.getArguments()`:

```ts
const args = decorator.getArguments(); // returns: Expression[]
```
```

Add and insert via `.addArgument(...)`, `.insertArguments(...)`, `.addArgument(...)`, or `.addArguments(...)`.

```ts
const args = decorator.insertArguments(1, ["5", "6"]);
```

And remove them by calling `.removeArgument()`:

```ts
// specify the index
decorator.removeArgument(0);
// or specify the argument node
decorator.removeArgument(args[0]);

### Type arguments

Get the decorator's type arguments by calling `.getTypeArguments()`:

```ts
const typeArgs = decorator.getTypeArguments(); // returns: TypeNode[]
```

Add and insert via `.insertTypeArgument(...)`, `.insertTypeArguments(...)`, `.addTypeArgument(...)`, or `.addTypeArguments(...)`.

```ts
const typeArgs = decorator.insertTypeArguments(1, ["string", "number"]);
```

And remove them by calling `.removeTypeArgument()`:

```ts
// specify the index
decorator.removeTypeArgument(0);
// or specify the type argument node
decorator.removeTypeArgument(typeArgs[0]);
```

### Call expression

Decorator factories are call expressions. Get the call expression by calling:

```ts
const callExpression = decorator.getCallExpression(); // returns: CallExpression | undefined
```

### Add/Insert decorators

Decorators can be added or inserted by calling `addDecorator(decorator)`, `addDecorators(decorators)`, `insertDecorator(index, decorator)`, or `insertDecorators(index, decorators)`.

For example:

```ts
classDeclaration.addDecorator({
    name: "MyDecorator",
    arguments: ["3", `"some string"`]
});
```

### Remove decorators

Call `.removeDecorator()`:

```ts
classDeclaration.removeDecorator(0); // index
classDeclaration.removeDecorator(classDeclaration.getDecorators()[0]); // node
```
