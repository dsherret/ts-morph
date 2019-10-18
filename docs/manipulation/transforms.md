---
title: Transforms
---

## Transforms

It is possible to transform the AST using the compiler API, though this is not a typical scenario.

For example:

```ts
import { ts } from "ts-morph";

const project = new Project();
const sourceFile = project.createSourceFile("Example.ts", "1; 2; 3;");

// this can be done starting on any node and not just the root node
sourceFile.transform(traversal => {
    const node = traversal.visitChildren(); // return type is `ts.Node`

    if (ts.isNumericLiteral(node)) {
        const incrementedValue = parseInt(node.text, 10) + 1;
        return ts.createNumericLiteral(incrementedValue.toString());
    }

    return node;
});

// outputs: 2; 3; 4;
console.log(sourceFile.getFullText());
```

Doing this is more performant, but you won't have type checking, symbols, and you'll be dealing directly with the TypeScript compiler API nodes. Additionally, all previously wrapped descendant nodes of transformed nodes will be forgotten (using them will result in an error being thrown).

### Conditionally visiting children

```ts
import { ts } from "ts-morph";

const project = new Project();
const sourceFile = project.createSourceFile("Example.ts", `
class C1 {
    myMethod() {
        function nestedFunction() {
        }
    }
}

class C2 {
    prop1: string;
}

function f1() {
    console.log("1");

    function nestedFunction() {
    }
}`);

sourceFile.transform(traversal => {
    // this will skip visiting the children of the classes
    if (ts.isClassDeclaration(traversal.currentNode))
        return traversal.currentNode;

    const node = traversal.visitChildren();
    if (ts.isFunctionDeclaration(node))
        return ts.updateFunctionDeclaration(node, [], [], undefined, ts.createIdentifier("newName"),
            [], [], undefined, ts.createBlock([]))
    return node;
});
```