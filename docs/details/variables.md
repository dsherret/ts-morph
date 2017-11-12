---
title: Variables
---

## Variable Statement

A variable statement looks like the following:

```typescript
export const var1 = "5", var2 = "6";
```

### Get a variable statement

Can be retrieved from source files, namespaces, or function bodies:

```typescript
const variableStatements = sourceFile.getVariableStatements();
const firstExportedVariableStatement = sourceFile.getVariableStatement(s => s.hasExportKeyword());
```

### Add/Insert

Add or insert variable statements to a source file, namespace, or function like declarations by calling `addVariableStatement()`, `addVariableStatements()`,
`insertVariableStatement()`, or `insertVariableStatements()`.

```typescript
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

```typescript
variableStatement.remove();
```

### Declaration type

Get:

```typescript
const declarationType = variableStatement.getDeclarationType();
```

It will return one of the following values:

```typescript
import {VariableDeclarationType} from "ts-simple-ast";

VariableDeclarationType.Let;
VariableDeclarationType.Const;
VariableDeclarationType.Var;
```

Set:

```typescript
variableStatement.setDeclarationType(VariableDeclarationType.Const);
```

## Variable Declaration

These are the individual declarations within a variable statement.

### Get variable declaration

Get them from the variable statement:

```typescript
const variableDeclarations = variableStatement.getDeclarations();
```

Or from source files, namespaces, and function bodies:

```typescript
const variableDeclarations = sourceFile.getVariableDeclarations();
const variableDeclaration = sourceFile.getVariableDeclaration("myVar");
const firstStringTypedVariableDeclaration = sourceFile.getVariableDeclaration(v =>
    v.getType().getText() === "string");
```

### Add/Insert

Add or insert variable declarations to a variable statement by calling `addDeclaration()`, `addDeclarations()`,
`insertDeclaration()`, or `insertDeclarations()`.

```typescript
const declaration = variableStatement.addDeclaration({ name: "num", type: "number" });
```

### Remove

Call `.remove()`:

```typescript
variableDeclaration.remove();
```
