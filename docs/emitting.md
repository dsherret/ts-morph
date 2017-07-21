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

Pass it in:

```typescript
ast.emit({ targetSourceFile: ast.getSourceFile("MyFile.ts") });
```

### Emitting only declaration files (.d.ts)

```typescript
ast.emit({ emitOnlyDtsFiles: true });
```
