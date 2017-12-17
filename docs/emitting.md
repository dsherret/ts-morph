---
title: Emitting
---

## Emitting

Emitting is easy. Here's an example:

```typescript
const ast = new TsSimpleAst({ compilerOptions: { outDir: "dist", declaration: true } });
ast.addSourceFile("MyFile.ts", "const num = 1;");
ast.emit();
```

Outputs two files in the `dist` folder:

```typescript
// MyFile.js
var num = 1;

// MyFile.d.ts
declare const num = 1;
```

### Emitting a single file

Call `.emit()` on the source file:

```typescript
const sourceFile = ast.getSourceFileOrThrow("MyFile.ts");
sourceFile.emit();
```

### Emitting only declaration files (.d.ts)

Specify the `emitOnlyDtsFiles` flag:

```typescript
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
