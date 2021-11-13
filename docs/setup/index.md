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
    target: ScriptTarget.ES3,
  },
});
```

### tsconfig.json

If you would like to manually specify the path to a _tsconfig.json_ file then specify that:

```ts
const project = new Project({
  tsConfigFilePath: "path/to/tsconfig.json",
});
```

_Note:_ You can override any `tsconfig.json` options by also providing a `compilerOptions` object.

For your convenience, this will automatically add all the associated source files from the _tsconfig.json_. If you don't wish to do that, then you will need to set `skipAddingFilesFromTsConfig` to `true`:

```ts
const project = new Project({
  tsConfigFilePath: "path/to/tsconfig.json",
  skipAddingFilesFromTsConfig: true,
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
      },
    };

    function removeTsExtension(moduleName: string) {
      if (moduleName.slice(-3).toLowerCase() === ".ts")
        return moduleName.slice(0, -3);
      return moduleName;
    }
  },
});
```

### `libFolderPath`

By default, ts-morph uses a fake folder path at `/node_modules/typescript/lib` to serve the TypeScript lib.d.ts files from memory.

If you do not want this behaviour, you may specify an actual folder to get the lib files from the file system from:

```ts
const project = new Project({
  libFolderPath: "./node_modules/typescript/lib",
});
```
