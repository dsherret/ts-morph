---
title: Structures
---

## Structures

Simplified AST representations called *structures* can be retreived from and used to set many `Node` objects.

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
    isExported: true,
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

### Traversing structures

#### `StructureTypeGuards`

Similar to `TypeGuards`, there is also a `StructureTypeGuards` export that you can use to check certain information about a structure.

For example:

```ts setup: const structure: Structures;
import { StructureTypeGuards } from "ts-morph";

// ...etc...

if (StructureTypeGuards.isExportable(structure))
    structure.isExported = false;
```

#### `forEachStructureChild`

Similar to the compiler API's `forEachChild`, there is a `forEachStructureChild` method in ts-morph for navigating over a structure's children.

For example:

```ts
import { StructureTypeGuards, forEachStructureChild, SourceFileStructure } from "ts-morph";

const structure: SourceFileStructure = {
    kind: StructureKind.SourceFile,
    statements: [{
        kind: StructureKind.Function,
        name: "myFunction",
        parameters: [{ name: "myParam" }]
    }]
};

forEachStructureChild(structure, child => {
    if (StructureTypeGuards.hasName(child))
        console.log(child.name);
});
```

Outputs: `"myFunction"`

##### Structures with no kind

Some structures have optional kinds. For example, in `parameters: [{ name: "myParam" }]` above, specifying `kind: StructureKind.Parameter` in the parameter would be unnecessarily repetitive. However, when using `forEachStructureChild`, you probably want to know the `kind` of the structure in order to do certain operations. For this reason, `forEachStructureChild` will automatically add the correct `kind` property to structures that don't have one.

##### Finding a child structure

Note that unlike ts-morph's `forEachChild`, this function acts like the `forEachChild` in the compiler API and will return any truthy value returned in the second argument's function:

```ts setup: const structure: SourceFileStructure;
const firstClassDecStructure = forEachStructureChild(structure,
    child => StructureTypeGuards.isClass(child) ? child : undefined);
```
