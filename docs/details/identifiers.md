---
title: Identifiers
---

## Identifiers

Identifiers are nodes that reference or define the name of a node.

For example, in the following code the identifiers are the variable name and the use of the variable:

```ts
const identifier = 5;

console.log(identifier);
```

### Getting identifiers

A lot of the time, a node will have a name and you can retrieve the identifier via `.getNameNode()`.

If not, from a given node, you can get all the children or descendants that are identifiers. For example:

```ts
const childIdentifiers = node.getChildrenOfKind(ts.SyntaxKind.Identifier);
const descendantIdentifiers = node.getDescendantsOfKind(ts.SyntaxKind.Identifier);
```

### Text

Get the text:

```ts
const text = identifier.getText();
```

### Rename

Rename an identifier:

```ts
identifier.rename("someNewName");
```

### Find References

Find all the references:

```ts
const references = identifier.findReferences();
```

### Get Definitions

Gets the definitions of the identifier. This is similar to "go to definition" functionality that exists with TypeScript in most IDEs.

```ts
const definitions = identifier.getDefinitions();
```

### Get Implementations

Gets the implementations of the identifier. This is similar to "go to implementation" functionality that exists with TypeScript in most IDEs.

```ts
const implementations = identifier.getImplementations();
```

### Type

Get the type of an identifier:

```ts
const identifierType = identifier.getType();
```
