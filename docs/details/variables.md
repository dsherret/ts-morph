---
title: Variables
---

## Variable Statement

A variable statement looks like the following:

```ts
export const var1 = "5", var2 = "6";
```

### Get a variable statement

Can be retrieved from source files, namespaces, or function bodies:

```ts
const variableStatements = sourceFile.getVariableStatements();
const firstExportedVariableStatement = sourceFile.getVariableStatement(s => s.hasExportKeyword());
```

### Add/Insert

Add or insert variable statements to a source file, namespace, or function like declarations by calling `addVariableStatement()`, `addVariableStatements()`,
`insertVariableStatement()`, or `insertVariableStatements()`.

```ts
import Ast, {VariableDeclarationType} from "ts-simple-ast";

const variableStatement = sourceFile.addVariableStatement({
    declarationType: VariableDeclarationType.Const // defaults to "let"
    declarations: [{
        name: "myNumber",
        initializer: "5"
    }, {
        name: "myString",
        type: "string",
        initializer: `'my string'`
    }]
});
```

### Remove

Call `.remove()`:

```ts
variableStatement.remove();
```

### Declaration type

Get:

```ts
const declarationType = variableStatement.getDeclarationType();
```

It will return one of the following values:

```ts
import {VariableDeclarationType} from "ts-simple-ast";

VariableDeclarationType.Let;
VariableDeclarationType.Const;
VariableDeclarationType.Var;
```

Set:

```ts
variableStatement.setDeclarationType(VariableDeclarationType.Const);
```

## Variable Declaration

These are the individual declarations within a variable statement.

### Get variable declaration

Get them from the variable statement:

```ts
const variableDeclarations = variableStatement.getDeclarations();
```

Or from source files, namespaces, and function bodies:

```ts
const variableDeclarations = sourceFile.getVariableDeclarations();
const variableDeclaration = sourceFile.getVariableDeclaration("myVar");
const firstStringTypedVariableDeclaration = sourceFile.getVariableDeclaration(v =>
    v.getType().getText() === "string");
```

### Add/Insert

Add or insert variable declarations to a variable statement by calling `addDeclaration()`, `addDeclarations()`,
`insertDeclaration()`, or `insertDeclarations()`.

```ts
const declaration = variableStatement.addDeclaration({ name: "num", type: "number" });
```

### Remove

Call `.remove()`:

```ts
variableDeclaration.remove();
```
