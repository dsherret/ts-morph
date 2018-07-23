---
title: Structures
---

## Structures: 

**methods fill(), getStructure(), add*() and insert*()**

The library supports a lightweight - serializable node representation called **structure**. In general declaration-like nodes supports structures. These are the operations related to structures: 

 * `node.getStructure()` will return the structure representing the node. Since is a plain-old JSON object you can save it in a string for later use. 
 * `node.fill(aStructure)` will "fill" an existing node with given structure that must correspond to the node's structure kind. 
 * `node.add*` methods starting with *add* like `sourceFile.addClass` will accept a structure.
 * `node.insert*` methods starting with *insert* like `sourceFile.insertClass` will accept a structure.

TIP: When possible is recommended to use `fill()`, `add*()` or `insert*()` methods for modifying the AST instead of string based methods like `insertText`, `replaceText`, or `removeText` because the AST will keep being valid (no forgotten nodes).

In the following example we will be using structures to add a new variable. Then `fill()` to change an existing variable and finally serialize the structure to a string to then recreate the same nodes in a new source file: 

```ts
const code = `const a = 1;`;
const program = new Project({ useVirtualFileSystem: true });
const sourceFile = program.createSourceFile('one.ts', code);
const a = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
  .find(declaration => declaration.getName() === 'a')!;

// now let's get a's structure and use it for creating a new variable declaration.
const structure = a.getStructure();
structure.name = "b";
structure.type = "string";
structure.initializer = "'so artificial'";

// we are ready to add it to the parent declaration list, just next to "a". 
// TIP: container kind of nodes methods add or insert accept structures
const parent = a.getAncestors().find(TypeGuards.isVariableDeclarationList)!;
const newDeclarations = parent.addDeclarations([structure]);

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
const emptyFile = program.createSourceFile('other.ts', '');
emptyFile.addVariableStatement(JSON.parse(str));
expect(emptyFile.getText()).to.equals(
    "const a: Promise<Date> = Promise.resolve(new Date()), b: string = 'so artificial';\n");
```
