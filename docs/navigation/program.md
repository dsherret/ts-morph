---
title: Program
---

## Program

Get the program by calling:

```ts
const program = ast.getProgram();
```

### Underlying compiler object

The underlying `ts.Program` can be retrieved as follows:

```ts
const tsProgram = program.compilerObject;
```

**Warning:** The underlying compiler object will be discared whenever manipulation occurs. For that reason, only hold onto the underlying compiler object between manipulations.

### Use

Generally you won't need to use the program, because most of the functionality is exposed as methods on the wrapped `Node` objects.
