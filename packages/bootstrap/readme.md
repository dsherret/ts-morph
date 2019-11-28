# @ts-morph/bootstrap

[![npm version](https://badge.fury.io/js/%40ts-morph%2Fbootstrap.svg)](https://badge.fury.io/js/%40ts-morph%2Fbootstrap)
[![Build Status](https://travis-ci.org/dsherret/ts-morph.svg?branch=latest)](https://travis-ci.org/dsherret/ts-morph)

A library for quickly getting set up with the [TypeScript](https://github.com/Microsoft/TypeScript) Compiler API.

This library is separate from [ts-morph](../ts-morph), but uses some of its underlying infrastructure.

* [Declarations](lib/ts-morph-bootstrap.d.ts)

## Example

```ts
import { Project, ts } from "@ts-morph/bootstrap";

const project = new Project();

// these are typed as ts.SourceFile
const myClassFile = project.createSourceFile(
    "MyClass.ts",
    "export class MyClass { prop: string; }"
);
const mainFile = project.createSourceFile(
    "main.ts",
    "import { MyClass } from './MyClass'"
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
const project = new Project({ tsConfigFilePath: "tsconfig.json" });
```

### File Systems

```ts
// will use a real file system
const project = new Project();

// in memory file system
const project2 = new Project({ useInMemoryFileSystem: true });

// custom file system
const fileSystem: FileSystemHost = { ...etc... };
const project = new Project({ fileSystem });
```

To access the file system after creating a project, you can use the `fileSystem` property:

```ts
project.fileSystem.writeFileSync("MyClass.ts", "class MyClass {}");
```

### Compiler options

```ts
const project = new Project({
    compilerOptions: {
        target: ts.ScriptTarget.ES3
    }
});
```

### tsconfig.json:

If you would like to manually specify the path to a tsconfig.json file then specify that:

```ts
const project = new Project({
    tsConfigFilePath: "packages/my-library/tsconfig.json"
});

// output all the source files that were added
console.log(project.getSourceFiles().map(s => s.fileName));
```

*Note:* You can override any tsconfig.json options by also providing a `compilerOptions` object.

For your convenience, this will automatically add all the associated source files from the tsconfig.json. If you don't wish to do that, then you will need to explicitly set `addFilesFromTsConfig` to `false`:

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

// This is deno style module resolution.
// Ex. `import { MyClass } from "./MyClass.ts"`;
const project = new Project({
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
                        moduleResolutionHost
                    );

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

## Adding Source Files

Use the following methods:

* `const sourceFiles = project.addSourceFilesByPaths("**/*.ts");` or provide an array of file globs.
* `const sourceFile = project.addSourceFileAtPath("src/my-file.ts");` or use `addSourceFileAtPathIfExists(filePath)`
* `const sourceFiles = project.addSourceFilesFromTsConfig("path/to/tsconfig.json")`

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
import { Project, ts } from "@ts-morph/bootstrap";

const project = new Project({ useInMemoryFileSystem: true });
project.createSourceFile("test.ts", "const t: string = 5;");

const program = project.createProgram();
const diagnostics = ts.getPreEmitDiagnostics(project.createProgram());

console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
```