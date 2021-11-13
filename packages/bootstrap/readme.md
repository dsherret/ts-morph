# @ts-morph/bootstrap

[![npm version](https://badge.fury.io/js/%40ts-morph%2Fbootstrap.svg)](https://badge.fury.io/js/%40ts-morph%2Fbootstrap)
[![CI](https://github.com/dsherret/ts-morph/workflows/CI/badge.svg)](https://github.com/dsherret/ts-morph/actions?query=workflow%3ACI)

A library for quickly getting set up with the [TypeScript](https://github.com/Microsoft/TypeScript) Compiler API.

This library is separate from [ts-morph](https://github.com/dsherret/ts-morph/blob/latest/packages/ts-morph/), but uses some of its underlying infrastructure.

- [Declarations](https://github.com/dsherret/ts-morph/blob/latest/packages/bootstrap/lib/ts-morph-bootstrap.d.ts)

## Example

```ts
import { createProject, ts } from "@ts-morph/bootstrap";

const project = await createProject(); // or createProjectSync

// these are typed as ts.SourceFile
const myClassFile = project.createSourceFile(
  "MyClass.ts",
  "export class MyClass { prop: string; }",
);
const mainFile = project.createSourceFile(
  "main.ts",
  "import { MyClass } from './MyClass'",
);

// ts.Program
const program = project.createProgram();
// ts.TypeChecker
const typeChecker = program.getTypeChecker();
// ts.LanguageService
const languageService = project.getLanguageService();
// ts.ModuleResolutionHost
const moduleResolutionHost = project.getModuleResolutionHost();
```

## Setup

Generally:

```ts
const project = await createProject({ tsConfigFilePath: "tsconfig.json" });
```

Or use the synchronous API:

```ts
const project = createProjectSync({ tsConfigFilePath: "tsconfig.json" });
```

### File Systems

```ts
// will use a real file system
const project = await createProject();

// in memory file system
const project2 = await createProject({ useInMemoryFileSystem: true });

// custom file system
const fileSystem: FileSystemHost = { ...etc... };
const project = await createProject({ fileSystem });
```

To access the file system after creating a project, you can use the `fileSystem` property:

```ts
project.fileSystem.writeFileSync("MyClass.ts", "class MyClass {}");
```

### Compiler options

```ts
const project = await createProject({
  compilerOptions: {
    target: ts.ScriptTarget.ES3,
  },
});
```

### tsconfig.json:

If you would like to manually specify the path to a tsconfig.json file then specify that:

```ts
const project = await createProject({
  tsConfigFilePath: "packages/my-library/tsconfig.json",
});

// output all the source files that were added
console.log(project.getSourceFiles().map(s => s.fileName));
```

_Note:_ You can override any tsconfig.json options by also providing a `compilerOptions` object.

For your convenience, this will automatically add all the associated source files from the tsconfig.json. If you don't wish to do that, then you will need to explicitly set `skipAddingFilesFromTsConfig` to `true`:

```ts
const project = await createProject({
  tsConfigFilePath: "path/to/tsconfig.json",
  skipAddingFilesFromTsConfig: true,
});
```

### Custom Module Resolution

Custom module resolution can be specified by providing a resolution host factory function. This also supports providing custom type reference directive resolution.

For example:

```ts
import { createProject, ts } from "@ts-morph/bootstrap";

// This is deno style module resolution.
// Ex. `import { MyClass } from "./MyClass.ts"`;
const project = await createProject({
  resolutionHost: (moduleResolutionHost, getCompilerOptions) => {
    return {
      resolveModuleNames: (moduleNames, containingFile) => {
        const compilerOptions = getCompilerOptions();
        const resolvedModules: ts.ResolvedModule[] = [];

        for (const moduleName of moduleNames.map(removeTsExtension)) {
          const result = ts.resolveModuleName(
            moduleName,
            containingFile,
            compilerOptions,
            moduleResolutionHost,
          );

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

## Adding Source Files

Use the following methods:

- `const sourceFiles = await project.addSourceFilesByPaths("**/*.ts");` or provide an array of file globs.
- `const sourceFile = await project.addSourceFileAtPath("src/my-file.ts");` or use `addSourceFileAtPathIfExists(filePath)`
- `const sourceFiles = await project.addSourceFilesFromTsConfig("path/to/tsconfig.json")`

Or use the corresponding `-Sync` suffix methods for a synchronous API (though it will be much slower).

## Creating Source Files

Use the `Project#createSourceFile` method:

```ts
const sourceFile = project.createSourceFile("MyClass.ts", "class MyClass {}");
```

## Updating a Source File

Use the `Project#updateSourceFile` method. This can be provided a file path and string for the text or a new `ts.SourceFile` object:

```ts
const newSourceFile = project.updateSourceFile("MyClass.ts", "class MyClass {}");
// or
project.updateSourceFile(newSourceFileObj);
```

## Removing a Source File

Use the `Project#removeSourceFile` method:

```ts
project.removeSourceFile("MyClass.ts");
// or
project.removeSourceFile(sourceFile);
```

## Formatting Diagnostics

```ts
import { createProject, ts } from "@ts-morph/bootstrap";

const project = await createProject({ useInMemoryFileSystem: true });
project.createSourceFile("test.ts", "const t: string = 5;");

const program = project.createProgram();
const diagnostics = ts.getPreEmitDiagnostics(project.createProgram());

console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
```
