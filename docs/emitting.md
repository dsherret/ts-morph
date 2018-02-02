---
title: Emitting
---

## Emitting

Emitting is easy. Here's an example:

```ts
const ast = new TsSimpleAst({ compilerOptions: { outDir: "dist", declaration: true } });
ast.addSourceFile("MyFile.ts", "const num = 1;");
ast.emit();
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
const sourceFile = ast.getSourceFileOrThrow("MyFile.ts");
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
ast.emit({ emitOnlyDtsFiles: true });
```

### Emit Diagnostics

Diagnostics about the emit can be found on the result:

```ts
const emitResult = ast.emit();
for (const diagnostic of emitResult.getDiagnostics())
    console.log(diagnostic.getMessageText());
```

These are good to always check when emitting to ensure everything went smoothly. They will explain why files aren't being emitted.
