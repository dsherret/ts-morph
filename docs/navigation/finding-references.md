---
title: Finding References
---

## Finding References

Find all the references of a node by calling `.findReferences()` on an identifier.

### Example

Simple example:

```ts
const classDeclaration = ...; // get a class or some other declaration somehow
const referencedSymbols = classDeclaration.getNameNode().findReferences();

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
