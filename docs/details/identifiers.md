---
title: Identifiers
---

## Identifiers

Identifiers are nodes that reference or define the name of a node.

For example, in the following code the identifiers are the variable name and the use of the variable:

```typescript
const identifier = 5;

console.log(identifier);
```

### Getting identifiers

From a given node, get all the children or descendants that are identifiers.

For example:

```typescript
const childIdentifiers = node.getChildrenOfKind(ts.SyntaxKind.Identifier);
const descendantIdentifiers = node.getDescendantsOfKind(ts.SyntaxKind.Identifier);
```

### Text

Get the text:

```typescript
const text = identifier.getText();
```

### Rename

Rename an identifier:

```typescript
identifier.rename("someNewName");
```

### Find References

Find all the references:

```typescript
const references = identifier.findReferences();
```

### Type

Get the type of an identifier:

```typescript
const identifierType = identifier.getType();
```
