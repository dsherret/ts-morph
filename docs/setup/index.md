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

Custom module resolution can be specified by providing a resolution host factory function. Type
reference directives are not covered — they resolve down a separate path in the compiler that has no
hook.

The compiler asks the host where a specifier points before resolving it itself. A host answers one
specifier at a time, and may answer with a file, with nothing, or with a _different specifier_ for the
compiler to resolve instead:

```ts
import { Project, ResolutionHosts } from "ts-morph";

// deno style module resolution (ex. `import { MyClass } from "./MyClass.ts"`)
const project = new Project({ resolutionHost: ResolutionHosts.deno });
```

That ready-made host rewrites rather than resolves: dropping the `.ts` says where to look, and the
compiler still decides how. A host of your own looks like this:

```ts
import { Project } from "ts-morph";

const project = new Project({
  resolutionHost: getCompilerOptions => ({
    resolveModuleName: ({ moduleName, containingFile, resolutionMode }) => {
      if (moduleName === "alias")
        return { resolvedFileName: "/Test.ts" }; // resolve it yourself
      if (moduleName.endsWith(".ts"))
        return { moduleName: moduleName.slice(0, -3) }; // resolve this instead
      return undefined; // leave it to the compiler
    },
  }),
});
```

`resolutionMode` is `ModuleKind.CommonJS` or `ModuleKind.ESNext` when the compiler has an opinion
about how the containing file imports, so a host can answer differently for an ESM and a CommonJS
importer.

### `libFolderPath`

By default, ts-morph uses a fake folder path at `/node_modules/typescript/lib` to serve the TypeScript lib.d.ts files from memory.

If you do not want this behaviour, you may specify an actual folder to get the lib files from the file system from:

```ts
const project = new Project({
  libFolderPath: "./node_modules/typescript/lib",
});
```
