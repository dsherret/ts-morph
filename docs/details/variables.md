---
title: Variables
---

## Variables

There is a hierarchy in the AST that's important to understand for variables:

1. Variable statement.
2. Variable declaration list.
3. Variable declaration.

## Variable Statement

Example:

```typescript
export const var1 = "5", var2 = "6";
```

From a variable statement you will be able to get or set (if implemented) a variable declaration list, documentation, ambient information, and exported information.

### Get a variable statement

Can be retrieved from source files, namespaces, or function bodies:

```typescript
const variableStatements = sourceFile.getVariableStatements();
const firstExportedVariableStatement = sourceFile.getVariableStatement(s => s.hasExportKeyword());
```

### Remove

Call `.remove()`:

```typescript
variableStatement.remove();
```

## Variable Declaration List

Example:

```typescript
const var1 = "5",
    var2 = "6";
```

Get one from the variable statement:

```typescript
const declarationList = variableStatement.getDeclarationList();
```

Or from source files, namespaces, and function bodies:

```typescript
const variableDeclarationLists = sourceFile.getVariableDeclarationLists();
const firstConstDeclaration = sourceFile.getVariableDeclarationList(l =>
    l.getDeclarationType() === VariableDeclarationType.Const);
```

### Declaration type

Get:

```typescript
const declarationType = variableDeclarationList.getDeclarationType();
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
variableDeclarationList.setDeclarationType(VariableDeclarationType.Const);
```

## Variable Declaration

These are the individual declarations within a variable declaration list.

### Get variable declaration

Get them from the variable declaration list:

```typescript
const variableDeclarations = variableDeclarationList.getDeclarations();
```

Or from source files, namespaces, and function bodies:

```typescript
const variableDeclarations = sourceFile.getVariableDeclarations();
const variableDeclaration = sourceFile.getVariableDeclaration("myVar");
const firstStringTypedVariableDeclaration = sourceFile.getVariableDeclaration(v =>
    v.getType().getText() === "string");
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
variableDeclaration.remove();
```
