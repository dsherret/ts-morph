---
title: Instantiating
---

## Instantiating

Use the default export from `"ts-simple-ast"`:

```ts
import Ast from "ts-simple-ast";

const ast = new Ast();
```

### Compiler options

```ts
import * as ts from "typescript";

const ast = new Ast({
    compilerOptions: {
        target: ts.ScriptTarget.ES3
    }
});
```

### tsconfig.json

If you would like to manually specify the path to a *tsconfig.json* file then specify that:

```ts
const ast = new Ast({
    tsConfigFilePath: "path/to/tsconfig.json"
});
```

*Note:* You can override any `tsconfig.json` options by also providing a `compilerOptions` object.

For your convenience, this will automatically add all the associated source files from the *tsconfig.json*. If you don't wish to do that, then you will need to explicitly set `addFilesFromTsConfig` to `false`:

```ts
const ast = new Ast({
    tsConfigFilePath: "path/to/tsconfig.json",
    addFilesFromTsConfig: false
});
```
