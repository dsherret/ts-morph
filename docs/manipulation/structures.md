---
title: Structures
---

## Structures: 

**methods fill(), getStructure(), add*() and insert*()**

The library supports a lightweight - serializable node representation called **structure**. In general declaration-like nodes supports structures through the following operations: 

 * `node.getStructure()` will return the structure representing the node. Since is a plain-old JSON object you can save it in a string for later use. 
 * `node.fill(aStructure)` will "fill" an existing node with given structure that must correspond to the node's structure kind. 
 * `node.add*` methods starting with *add* like `sourceFile.addClass` will accept a structure.
 * `node.insert*` methods starting with *insert* like `sourceFile.insertClass` will accept a structure.

TIP: When possible is recommended to use `fill()`, `add*()` or `insert*()` methods for insertions instead of string based methods like `insertText`, `replaceText`, or `removeText` because the AST will keep being valid (no forgotten nodes).

IMPORTANT: when recreating an AST from a structure and then printing back, is probable that the resulting string won't be identical to the original one, if, for example, the target project has different formatting rules. Expect that indentation could be different.  

In the following example we will be using structures to add a new variable. Then `fill()` to change an existing variable and finally serialize the structure to a string to then recreate the same nodes in a new source file: 

```ts
const code = `const a = 1;`;
const sourceFile = project.createSourceFile('one.ts', `const a = 1;`);
const a = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)[0];

// now let's get a's structure and use it for creating a new variable declaration.
const structure = a.getStructure();
structure.name = "b";
structure.type = "string";
structure.initializer = "'so artificial'";

// we are ready to add it to the parent declaration list, just next to "a".
const parent = a.getAncestors().find(TypeGuards.isVariableDeclarationList)!;
const newDeclarations = parent.addDeclaration(structure);

expect(sourceFile.getText()).to.equals("const a = 1, b: string = 'so artificial';");

// and now demonstrate the use of fill() for changing existing "a" variable:
structure.type = "Promise<Date>";
structure.initializer = "Promise.resolve(new Date())";
a.fill(structure);

expect(sourceFile.getText()).to.equals(
    "const a: Promise<Date> = Promise.resolve(new Date()), b: string = 'so artificial';");

// and of course we can serialize structures to text and re-create the nodes after:
const parentStatement = a.getAncestors().find(TypeGuards.isVariableStatement)!;
const str = JSON.stringify(parentStatement.getStructure());
const emptyFile = project.createSourceFile('other.ts', '');
emptyFile.addVariableStatement(JSON.parse(str));
expect(emptyFile.getText()).to.equals(
    "const a: Promise<Date> = Promise.resolve(new Date()), b: string = 'so artificial';\n");
```
