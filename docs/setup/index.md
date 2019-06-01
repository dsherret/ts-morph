---
title: Instantiating
---

## Instantiating

Use the `Project` named export from `"ts-morph"`:

```ts
import { Project } from "ts-morph";

const project = new Project();
```

### Compiler options

```ts
import { Project, ScriptTarget } from "ts-morph";

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

### Custom Module Resolution

Custom module resolution can be specified by providing a resolution host factory function. This also supports providing custom type reference directive resolution.

For example:

```ts
import { Project, ts } from "ts-morph";

// this is deno style module resolution (ex. `import { MyClass } from "./MyClass.ts"`)
const project = new Project({
    resolutionHost: (moduleResolutionHost, getCompilerOptions) => {
        return {
            resolveModuleNames: (moduleNames, containingFile) => {
                const compilerOptions = getCompilerOptions();
                const resolvedModules: ts.ResolvedModule[] = [];

                for (const moduleName of moduleNames.map(removeTsExtension)) {
                    const result = ts.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost);
                    if (result.resolvedModule)
                        resolvedModules.push(result.resolvedModule);
                }

                return resolvedModules;
            }
        };

        function removeTsExtension(moduleName: string) {
            if (moduleName.slice(-3).toLowerCase() === ".ts")
                return moduleName.slice(0, -3);
            return moduleName;
        }
    }
});
```
