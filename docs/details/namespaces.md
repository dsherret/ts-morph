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

### Module or namespace?

Check for the keyword you want:

```ts
namespaceDeclaration.hasModuleKeyword(); // returns: boolean
namespaceDeclaration.hasNamespaceKeyword(); // returns: boolean
```

Or set one or the other:

```ts
namespaceDeclaration.setHasModuleKeyword(); // optionally pass in a boolean
namespaceDeclaration.setHasNamespaceKeyword();
```

Or get the keyword:

```ts
namespaceDeclaration.getDeclarationTypeKeyword(); // returns: the module or namespace keyword
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
