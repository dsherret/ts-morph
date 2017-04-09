---
title: Navigating the AST
---

## Navigating Within Source Files

The best way to explore what's implemented is to look at the autocompletion/intellisense results.

### Example

#### Setup

Given the following file:

```typescript
// Person.ts

interface Person {
    name: string;
    age: number;
}

export default Person;
```

And setup:

```typescript
import Ast from "ts-simple-ast";

const ast = new Ast();
ast.addSourceFiles("**/*.ts");
```

#### Use

First you need to get the source file you would like to look at:

```typescript
const sourceFile = ast.getSourceFile("Person.ts");
```

Now inspect what's inside... here's a few examples:

```typescript
const hasClasses = sourceFile.getClasses().length > 0;
const interfaces = sourceFile.getInterfaces();

// person interface
const personInterface = sourceFile.getInterface("Person")!;
personInterface.isDefaultExport(); // returns true
personInterface.getName();         // returns "Person"
personInterface.getProperties();   // returns the properties
```

**Next step:** [Underlying Compiler Nodes](compiler-nodes)
