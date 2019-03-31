---
title: Refactors
---

Besides `rename()`, `remove()`, `setOrder()`, etc. there are other code refactor tools available in `SourceFile`. 

Notice that, in general they **will forget all the nodes** in the file, so it's best to apply them after you're all done with the file.

When adding code, they will use current project [Manipulation Settings](./settings) but custom settings can be given also.

## Organize Imports

`SourceFile#organizeImports()` method will refactor file's import declarations so they are formatted, ordered, and unused imports removed.

## Fix Missing Imports

`SourceFile#fixMissingImports()` method will add import declarations for identifiers that are referenced, but not imported in the source file.

## Remove Unused Declarations

`SourceFile#removeUnusedDeclarations()` method will remove all unused declarations, like variables, classes, members, parameters, type parameters, etc, from the file.
