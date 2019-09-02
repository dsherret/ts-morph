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
import { Project, VariableDeclarationKind } from "ts-morph";

const variableStatement = sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const, // defaults to "let"
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
const declarationKind = variableStatement.getDeclarationKind();
```

It will return one of the following values:

```ts
import { VariableDeclarationKind } from "ts-morph";

VariableDeclarationKind.Let;
VariableDeclarationKind.Const;
VariableDeclarationKind.Var;
```

Set:

```ts
variableStatement.setDeclarationKind(VariableDeclarationKind.Const);
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
