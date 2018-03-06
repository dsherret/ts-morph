---
title: Instantiating
---

## Instantiating

Use the default export from `"ts-simple-ast"`:

```ts
import Project from "ts-simple-ast";

const project = new Project();
```

### Compiler options

```ts
import Project, {ScriptTarget} from "ts-simple-ast";

const project = new Project({
    compilerOptions: {
        target: ScriptTarget.ES3
    }
});
```

### tsconfig.json

If you would like to manually specify the path to a *tsconfig.json* file then specify that:

```ts
const project = new Project({
    tsConfigFilePath: "path/to/tsconfig.json"
});
```

*Note:* You can override any `tsconfig.json` options by also providing a `compilerOptions` object.

For your convenience, this will automatically add all the associated source files from the *tsconfig.json*. If you don't wish to do that, then you will need to explicitly set `addFilesFromTsConfig` to `false`:

```ts
const project = new Project({
    tsConfigFilePath: "path/to/tsconfig.json",
    addFilesFromTsConfig: false
});
```
