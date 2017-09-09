---
title: Instantiating
---

## Instantiating

Use the default export from `"ts-simple-ast"`:

```typescript
import Ast from "ts-simple-ast";

const ast = new Ast();
```

### Custom compiler options

```typescript
import * as ts from "typescript";

const ast = new Ast({
    compilerOptions: {
        target: ts.ScriptTarget.ES3
    }
});
```

### Custom tsconfig.json

If you would like to manually specify the path to a *tsconfig.json* file then specify that:

```typescript
const ast = new Ast({
    tsConfigFilePath: "path/to/tsconfig.json"
});
```

Note: You can override any `tsconfig.json` options by also providing a `compilerOptions` object.
