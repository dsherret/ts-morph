---
title: Module / Namespace Declarations
---

## Module / Namespace Declarations

Module declarations may look like any of the following:

```ts ignore-error: 2664
namespace MyNamespace {
}

module MyModule {
}

declare module "some-module" {
}

declare module "other-module";
```

They can be retrieved from source files or other modules/namespaces:

```ts
const modules = sourceFile.getModules();
const namespace1 = sourceFile.getModule("Namespace1");
const firstNamespaceWithClass = sourceFile.getModule(n => n.getClasses().length > 0);
```

Most of the information you can get about namespaces is covered in other sections.

Note: Although it's a compile error, you can also retrieve namespaces from function bodies.

### Add/Insert

Add or insert namespaces to a source file, namespace, or function like declarations by calling `addModule()`, `addModules()`, `insertModule()`, or `insertModules()`.

```ts
const moduleDeclaration = sourceFile.addModule({
    name: "ModuleName",
});
```

### Remove

Call `.remove()`:

```ts
moduleDeclaration.remove();
```

### Module, namespace, or `global`?

Check for the declaration kind or keywords:

```ts
moduleDeclaration.getDeclarationKind(); // returns: ModuleDeclarationKind
// or
moduleDeclaration.hasModuleKeyword(); // returns: boolean
moduleDeclaration.hasNamespaceKeyword(); // returns: boolean
```

Or set the declaration kind:

```ts
moduleDeclaration.setDeclarationKind(ModuleDeclarationKind.Namespace);
moduleDeclaration.setDeclarationKind(ModuleDeclarationKind.Module);
moduleDeclaration.setDeclarationKind(ModuleDeclarationKind.Global);
```

Or get the keyword:

```ts
// returns: the module or namespace keyword or undefined if global
moduleDeclaration.getDeclarationKindKeyword();
```

**Reminder:** Module declarations that are `global` have the following syntax:

```ts ignore-error: 2664, 2669
declare module "my-library" {
    // this is a global namespace declaration
    global {
        const foo: string;
    }
}
```

### Unwrap

A module declaration can be replaced with its body using the `.unwrap()` method.

Given the following code:

```ts
namespace MyNamespace {
    function someFunction() {
    }

    class SomeClass {
    }
}
```

Calling `.unwrap()` will change the code to the following:

```ts
function someFunction() {
}

class SomeClass {
}
```
