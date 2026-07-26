# Tests for genuinely removed capabilities

These two cover capabilities the Go compiler does not have, so they import exports
that no longer exist. Left in the tree deliberately: they are the record of what
the migration dropped.

They are excluded in `.mocharc.yml` because an import of a missing export throws
at module load, which aborts the entire mocha run rather than failing one test.

- `refactorEditInfoTests.ts` — `LanguageService#getEditsForRefactor` and
  `RefactorEditInfo`. tsgo has no refactor surface at all: no refactor providers,
  no `GetEditsForRefactor`, and no way for its change tracker to emit a new file,
  which "Move to a new file" needs.
- `jsDocFunctionTypeTests.ts` — the `JSDocFunctionType` wrapper. tsgo's parser
  emits no such kind; `internal/checker/nodecopy.go:544` records it as retired
  (`// if node.Kind == ast.KindJSDocFunctionType {} // !!! no longer exists`).

Everything else that was once quarantined here has been restored and moved back to
its original path. Nothing recoverable is left in this directory. If a capability
here ever becomes available, move its file back and drop the `.mocharc.yml`
exclusion.

See `tsgo-wasm/BREAKING-CHANGES.md` for the full inventory, split into what is
genuinely absent and what is merely not yet exposed.
