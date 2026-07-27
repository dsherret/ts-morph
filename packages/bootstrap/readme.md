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
    target: ts.ScriptTarget.ES2015,
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

Custom module resolution can be specified by providing a resolution host factory function. Type reference directives are not covered — they resolve down a separate path in the compiler that has no hook.

For example:

```ts
import { createProject, ResolutionHosts } from "@ts-morph/bootstrap";

// This is deno style module resolution.
// Ex. `import { MyClass } from "./MyClass.ts"`;
const project = await createProject({ resolutionHost: ResolutionHosts.deno });
```

A host is asked about one specifier at a time and says where it points. It may
answer with a file, with nothing, or with a different specifier for the compiler
to resolve instead — which is what the Deno host above does, since dropping the
`.ts` says where to look and the compiler still decides how:

```ts
const project = await createProject({
  resolutionHost: getCompilerOptions => ({
    resolveModuleName: ({ moduleName, containingFile, resolutionMode }) => {
      if (moduleName === "alias")
        return { resolvedFileName: "/Test.ts" };
      return undefined; // let the compiler resolve it
    },
  }),
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
