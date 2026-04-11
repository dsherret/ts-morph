---
title: Structures
---

## Structures

Simplified AST representations called _structures_ can be retreived from and used to set many `Node` objects.

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

### Printing to string

Structures can be printed to a string using the `printStructure` function. This is useful for code generation without needing a `Project` instance.

```ts
import { printStructure, StructureKind } from "ts-morph";

const code = printStructure({
  kind: StructureKind.Class,
  name: "MyClass",
  isExported: true,
  properties: [{ name: "myProp", type: "string" }],
  methods: [{
    name: "myMethod",
    parameters: [{ name: "param", type: "number" }],
    returnType: "void",
  }],
});
```

Outputs:

```ts
export class MyClass {
  myProp: string;

  myMethod(param: number): void {
  }
}
```

Mostly any structure with a `kind` property can be printed, including `SourceFile`, `Interface`, `Enum`, `Function`, `TypeAlias`, and more.

#### Options

Formatting can be customized with an optional second argument:

```ts
const code = printStructure(structure, {
  indentNumberOfSpaces: 2,
  useTabs: false,
  newLine: "\n",
  useSingleQuote: true,
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
});
```

### Traversing structures

#### `Structure` type guards

Similar to static methods found on `Node`, there is also a `Structure` export that you can use to check certain information about a structure.

For example:

```ts setup: const structure: Structures;
import { Structure } from "ts-morph";

// ...etc...

if (Structure.isExportable(structure))
  structure.isExported = false;
```

#### `forEachStructureChild`

Similar to the compiler API's `forEachChild`, there is a `forEachStructureChild` method in ts-morph for navigating over a structure's children.

For example:

```ts
import { forEachStructureChild, SourceFileStructure, Structure } from "ts-morph";

const structure: SourceFileStructure = {
  kind: StructureKind.SourceFile,
  statements: [{
    kind: StructureKind.Function,
    name: "myFunction",
    parameters: [{ name: "myParam" }],
  }],
};

forEachStructureChild(structure, child => {
  if (Structure.hasName(child))
    console.log(child.name);
});
```

Outputs: `"myFunction"`

##### Structures with no kind

Some structures have optional kinds. For example, in `parameters: [{ name: "myParam" }]` above, specifying `kind: StructureKind.Parameter` in the parameter would be unnecessarily repetitive. However, when using `forEachStructureChild`, you probably want to know the `kind` of the structure in order to do certain operations. For this reason, `forEachStructureChild` will automatically add the correct `kind` property to structures that don't have one.

##### Finding a child structure

Note that unlike ts-morph's `forEachChild`, this function acts like the `forEachChild` in the compiler API and will return any truthy value returned in the second argument's function:

```ts setup: const structure: SourceFileStructure;
const firstClassDecStructure = forEachStructureChild(structure, child => Structure.isClass(child) ? child : undefined);
```
