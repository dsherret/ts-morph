---
title: Namespaces
---

## Namespaces

Namespaces (or modules) can be retrieved from source files or other namespaces:

```ts
const namespaces = sourceFile.getNamespaces();
const namespace1 = sourceFile.getNamespace("Namespace1");
const firstNamespaceWithClass = sourceFile.getNamespace(n => n.getClasses().length > 0);
```

Most of the information you can get about namespaces is covered in other sections.

Note: Although it's a compile error, you can also retreive namespaces from function bodies.

### Add/Insert

Add or insert namespaces to a source file, namespace, or function like declarations by calling `addNamespace()`, `addNamespaces()`, `insertNamespace()`, or `insertNamespaces()`.

```ts
const namespaceDeclaration = sourceFile.addNamespace({
    name: "NamespaceName"
});
```

### Remove

Call `.remove()`:

```ts
namespaceDeclaration.remove();
```

### Module, namespace, or `global`?

Check for the declaration kind or keywords:

```ts
namespaceDeclaration.getDeclarationKind(); // returns: NamespaceDeclarationKind
// or
namespaceDeclaration.hasModuleKeyword(); // returns: boolean
namespaceDeclaration.hasNamespaceKeyword(); // returns: boolean
```

Or set the declaration kind:

```ts
namespaceDeclaration.setDeclarationKind(NamespaceDeclarationKind.Namespace);
namespaceDeclaration.setDeclarationKind(NamespaceDeclarationKind.Module);
namespaceDeclaration.setDeclarationKind(NamespaceDeclarationKind.Global);
```

Or get the keyword:

```ts
// returns: the module or namespace keyword or undefined if global
namespaceDeclaration.getDeclarationKindKeyword();
```

**Reminder:** Namespace declarations that are `global` have the following syntax:

```ts ignore-error: 2664, 2669
declare module "my-library" {
    // this is a global namespace declaration
    global {
        const foo: string;
    }
}
```

### Unwrap

A namespace declaration can be replaced with its body using the `.unwrap()` method.

Given the following code:

```ts
namespace MyNamespace {
    function someFunction() {
    }

    class SomeClass {
    }
}
```

Calling `.unwrap()` on the namespace will change the code to the following:

```ts
function someFunction() {
}

class SomeClass {
}
```
