---
title: Emitting
---

## Emitting

Emitting is easy. Here's an example:

```ts
const project = new Project({ compilerOptions: { outDir: "dist", declaration: true } });
project.createSourceFile("MyFile.ts", "const num = 1;");
project.emit();
```

Outputs two files in the `dist` folder:

```ts
// MyFile.js
var num = 1;

// MyFile.d.ts
declare const num = 1;
```

### Emitting a single file

Call `.emit()` on the source file:

```ts
const sourceFile = project.getSourceFileOrThrow("MyFile.ts");
sourceFile.emit();
```

Or get its emit output:

```ts
const emitOutput = sourceFile.getEmitOutput();
emitOutput.getEmitSkipped(); // returns: boolean
for (const outputFile of emitOutput.getOutputFiles()) {
    outputFile.getFilePath();
    outputFile.getWriteByteOrderMark();
    outputFile.getText();
}
```

### Emitting only declaration files (.d.ts)

Specify the `emitOnlyDtsFiles` flag:

```ts
project.emit({ emitOnlyDtsFiles: true });
```

### Emit Diagnostics

Diagnostics about the emit can be found on the result:

```ts
const emitResult = project.emit();
for (const diagnostic of emitResult.getDiagnostics())
    console.log(diagnostic.getMessageText());
```

These are good to always check when emitting to ensure everything went smoothly. They will explain why files aren't being emitted.

### Emitting with custom transformations

You can emit using the compiler API's custom transformations by specifying them on the `customTransformers` option.

The following example will emit the code with all numeric literals change to string literals:

```ts
project.emit({
    customTransformers: {
        // optional transformers to evaluate before built in .js transformations
        before: [context => sourceFile => visitSourceFile(sourceFile, context, numericLiteralToStringLiteral)],
        // optional transformers to evaluate after built in .js transformations
        after: [],
        // optional transformers to evaluate after built in .d.ts transformations
        afterDeclarations: []
    }
});

function visitSourceFile(sourceFile: ts.SourceFile, context: ts.TransformationContext, visitNode: (node: ts.Node) => ts.Node) {
    return visitNodeAndChildren(sourceFile) as ts.SourceFile;

    function visitNodeAndChildren(node: ts.Node): ts.Node {
        return ts.visitEachChild(visitNode(node), visitNodeAndChildren, context);
    }
}

function numericLiteralToStringLiteral(node: ts.Node) {
    if (ts.isNumericLiteral(node))
        return ts.createStringLiteral(node.text);
    return node;
}
```
