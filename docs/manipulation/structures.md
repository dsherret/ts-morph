---
title: Structures
---

## Structures

Lightweight serializable node representations called **structures** can be retreived from and used to
set many `Node` objects.

### Getting structure

To get the structure of a node, call `node.getStructure()`.

```ts
// example with a class declaration, but this also works on interfaces, enums, and many other nodes.
const classStructure = classDeclaration.getStructure(); // returns: ClassDeclarationStructure
```

In the example above, a class declaration like the following...

```ts
export class MyClass {
    myProp = 5;
}
```

...would return the following structure object similar to the following:

```js
{
    isAbstract: false,
    hasExportKeyword: true,
    name: "MyClass",
    typeParameters: [],
    constructors: [],
    properties: [{
        name: "myProp",
        initializer: "5",
        type: undefined,
        isReadonly: false,
        isStatic: false
    }],
    methods: []
}
```

### Setting with structure

It's also possible to set the structure of a node with an existing structure:

```ts setup: const classStructure = {};
classDeclaration.set(classStructure);
// sets the name
classDeclaration.set({ name: "NewName" });
// sets the properties
classDeclaration.set({ properties: [{ name: "newProperty" }] });
```

Or you can use the `addX` or `insertX` methods with a structure:

```ts
sourceFile.addClass({ name: "NewClass", ...classDeclaration.getStructure() });
```
