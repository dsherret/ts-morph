---
title: Structures
---

## Structures

Lightweight serializable node representations called **structures** can be retreived from and used to
fill many `Node` objects.

### Getting structure

To get the structure of a node, call `node.getStructure()`.

```ts
// example with a class declaration, but this also works on interfaces, enums, and many other nodes.
const classStructure = classDeclaration.getStructure(); // returns: ClassDeclarationStructure
```

In the example above, a class declaration like the following...

```ts
export class MyClass {
    myProp: string;
}
```

...would return the following structure object:

```js
{
    hasExportKeyword: true;
    name: "MyClass",
    properties: [{
        name: "myProp",
        type: "string"
    }]
}
```

### Filling with structure

It's also possible to set the structure of a node with an existing structure:

```ts
classDeclaration.fill(classStructure);
// sets the name
classDeclaration.fill({ name: "NewName" });
// adds a property
classDeclaration.fill({ properties: [{ name: "newProperty" }] });
```

Or you can use the `addX` or `insertX` methods with a structure:

```ts
sourceFile.addClass({ name: "NewClass", ...classDeclaration.getStructure() });
```
