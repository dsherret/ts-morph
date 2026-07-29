---
title: Emitting
---

## Emitting

Emitting is is the process of taking the original TypeScript files and outputting them as JavaScript (`.js`) and/or declaration files (`.d.ts`).

Here's an example:

```ts
const project = new Project({ compilerOptions: { outDir: "dist", declaration: true } });
project.createSourceFile("MyFile.ts", "const num = 1;");
project.emit(); // async

// or
project.emitSync(); // slow
```

This outputs two files in the `dist` folder:

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
sourceFile.emit(); // async, fast

// or
sourceFile.emitSync(); // slow
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
const emitResult = await project.emit();
for (const diagnostic of emitResult.getDiagnostics())
  console.log(diagnostic.getMessageText());
```

These are good to always check when emitting to ensure everything went smoothly. They will explain why files aren't being emitted.

### Custom transformations

There is no `customTransformers` option. The emitter runs inside the compiler and
does not accept JavaScript transforms, so there is nothing for one to hook into.

To change what is emitted, change the source instead: manipulate the AST with
ts-morph, emit, and undo the manipulation if the in-memory tree should not keep
it.

## Emitting to Memory

If you don't want to emit to the file system, you can call `emitToMemory()`:

```ts
const project = new Project({ compilerOptions: { outDir: "dist" } });
project.createSourceFile("MyFile.ts", "const num = 1;");
const result = project.emitToMemory();

// output the emitted files to the console
for (const file of result.getFiles()) {
  console.log("----");
  console.log(file.filePath);
  console.log("----");
  console.log(file.text);
  console.log("\n");
}

// or finally save this result to the underlying file system (or use `saveFilesSync()`)
result.saveFiles().then(() => console.log("written"));
```

To manipulate after emitting, you may load the result into a new project and manipulate that:

```ts
const project = new Project({ compilerOptions: { outDir: "dist" } });
project.createSourceFile("MyFile.ts", "const num = 1;");
const result = project.emitToMemory();

// load the javascript files into a new project
const newProject = new Project();
for (const file of result.getFiles())
  newProject.createSourceFile(file.filePath, file.text, { overwrite: true });

// ...manipulate the javascript files here...

// save the new files to the file system
await newProject.save();
```

...but consider using the custom transformers discussed above if you want it to be faster.
