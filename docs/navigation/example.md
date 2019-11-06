---
title: Navigation example
---

## Example - Navigating Within Source Files

### Setup

Given the following file:

```ts
// Person.ts

interface Person {
    name: string;
    age: number;
}

export default Person;
```

And setup:

```ts
import { Project } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("**/*.ts");
```

### Use

First you need to get the source file you would like to look at:

```ts
const sourceFile = project.getSourceFileOrThrow("Person.ts");
```

Now inspect what's inside... here's a few examples:

```ts
const hasClasses = sourceFile.getClasses().length > 0;
const interfaces = sourceFile.getInterfaces();

// person interface
const personInterface = sourceFile.getInterface("Person")!;
personInterface.isDefaultExport(); // returns true
personInterface.getName();         // returns "Person"
personInterface.getProperties();   // returns the properties
```
