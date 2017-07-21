---
title: Emitting
---

## Emitting

Emitting is easy. Here's an example:

```typescript
const ast = new TsSimpleAst({ compilerOptions: { out: "dist", declaration: true } });
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

Call `.emit()` on source files:

```typescript
ast.getSourceFile("MyFile.ts").emit();
```

### Emitting only declaration files (.d.ts)

Specify the `emitOnlyDtsFiles` flag:

```typescript
ast.emit({ emitOnlyDtsFiles: true });
```
