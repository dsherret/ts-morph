---
title: Finding References
---

## Finding References

Find all the references of a node by calling `.findReferences()` on an identifier or named/nameable declaration.

### Example

Simple example:

```ts
const classDeclaration = ...; // get a class or some other declaration somehow
const referencedSymbols = classDeclaration.findReferences();

for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
        console.log("---------")
        console.log("REFERENCE")
        console.log("---------")
        console.log("File path: " + reference.getSourceFile().getFilePath());
        console.log("Start: " + reference.getTextSpan().getStart());
        console.log("Length: " + reference.getTextSpan().getLength());
        console.log("Parent kind: " + reference.getNode().getParentOrThrow().getKindName());
        console.log("\n");
    }
}
```

## Finding Referencing Nodes

The `.findReferences()` method returns back a lot of information that might not be necessary.
If you just went the nodes that reference the named/nameable declaration, then use the
following method:

```ts
const nodes = classDeclaration.getReferencingNodes();
```
