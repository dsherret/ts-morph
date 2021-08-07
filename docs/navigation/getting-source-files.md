---
title: Getting Source Files
---

## Getting Source Files

After source files are added, you will need to get them in order to navigate or make changes.

### All

Get all the source files:

```ts
const sourceFiles = project.getSourceFiles();
```

Or filter by glob:

```ts
// single
const testSourceFiles = project.getSourceFiles("src/test/**/*.ts");
// or multiple
const nonTestSourceFiles = project.getSourceFiles([
    "src/**/*.ts",
    "!src/test/**/*.ts",
]);
```

Know that the path resolution and matching is done **relatively to the current directory**.

If you load a project from another directory. Like in:

```ts
const projectDirectory = '/someDirectory/notCurrent'

const project = new Project({
    tsConfigFilePath: `${projectConfigFile}/tsconfig.json`
})
```

To match a file from that directory you need to do that relatively to the current directory. Or by an absolute path.

```ts
const sourceFile = project.getSourceFiles(`${projectDirectory}/**/config/index.ts`)
```

You can see more details [here](https://github.com/dsherret/ts-morph/issues/1185#issuecomment-894704303)

### By file path

Will return the first source file that matches the end of the provided file path:

```ts
const personFile = project.getSourceFile("Models/Person.ts");
```

### By condition

Will return the first source file that matches the provided condition:

```ts
const fileWithFiveClasses = project.getSourceFile(f => f.getClasses().length === 5);
```
