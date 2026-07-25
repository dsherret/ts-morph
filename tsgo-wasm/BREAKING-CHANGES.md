# Breaking changes: moving to tsgo

Everything below is a consequence of replacing the `typescript` package with
tsgo (TypeScript 7+, the Go compiler) running in-process via WebAssembly. This
is a running list for the migration on the `tsgo-wasm` branch; it is not
complete until the migration is.

The single cause behind most of it: **tsgo owns parsing, module resolution, and
the file system.** The `typescript` package let you hand the compiler text and
host callbacks and get a parsed tree back. tsgo inverts that — you tell a session
what changed and read results back — so the entire host layer has nothing to
plug into.

---

## Removed

### Custom module resolution — removed for now, but recoverable

`ResolutionHost`, `ResolutionHostFactory`, and `ResolutionHosts` (including
`ResolutionHosts.deno`) are gone, along with `resolveModuleNames`,
`resolveTypeReferenceDirectives`, and
`getResolvedModuleWithFailedLookupLocationsFromCache`.

tsgo resolves modules internally and exposes no hook to a client, so there is
nothing to migrate to **today**. It affects Deno users in particular, since
`ResolutionHosts.deno` existed to strip `.ts` extensions during resolution.

Two things make this less final than it looks:

1. **Resolution already runs against the client's file system.** Every probe
   goes through the delegated `fileExists` / `readFile` / `realpath` /
   `getAccessibleEntries` callbacks, so what resolution *finds* can already be
   influenced from JS. That covers redirection, but not rewriting a specifier.
2. **A real hook is a small change in the fork.** `Resolver.ResolveModuleName`
   (`internal/module/resolver.go`) is the choke point, and the file loader
   constructs the resolver in one place (`internal/compiler/fileloader.go`). A
   wrapper that asks the client first and falls back to the built-in resolver
   would follow exactly the pattern `callbackFS` already uses — a callback over
   the same connection. Full coverage also means the resolvers built in
   `internal/ls/autoimport` and `internal/ls/sourcedefinition.go`.

**Planned:** revisit after the rest of the migration lands; see "Still in
flight".

### `Node#transform`

`Node#transform` and `TransformTraversalControl` are removed, and **`ts.factory`
is no longer exposed to users**.

The API was built on `ts.createPrinter`, `ts.transform`, `ts.visitEachChild`,
and the `factory` handed to the visitor. tsgo provides none of these to clients
— it prints on the server — so there was no subset worth keeping. Producing new
code by text (which is what the rest of ts-morph does) is unaffected.

### Wrappers for node kinds tsgo does not produce

`CommaListExpression`, `JSDocFunctionType`, `JSDocAuthorTag`, `JSDocClassTag`,
`JSDocEnumTag`, `JSDocMemberName`, `JSDocNamepathType`, and `JSDocUnknownType`
are removed. tsgo's parser emits no such kinds, so the wrappers could never be
instantiated.

### Compiler hosts

`createHosts`, `createModuleResolutionHost`, and `TsSourceFileContainer` are
removed, as are the `ts.LanguageServiceHost`, `ts.CompilerHost`, and
`ts.ModuleResolutionHost` types they implemented.

### Cross-project document caching

`createDocumentCache` is removed. It worked by deep-cloning a parsed
`ts.SourceFile` and re-stamping its `fileName`; tsgo's nodes are lazy views over
a binary buffer with a circular back-reference to their source file, so they
cannot be cloned that way. The session's own snapshot cache serves this purpose.

---

## Changed shape

### The `ts` namespace is tsgo's, and its enum values differ

`SyntaxKind.ClassDeclaration` is a *different number* than in the `typescript`
package. The same is true of every other enum.

Nodes and kinds must therefore come from the same backend. Mixing tsgo nodes
with `typescript`'s enums (or the reverse) does not fail loudly — it silently
misidentifies every node. Code comparing kinds against hard-coded numbers, or
persisting kind values across versions, will break.

### `DocumentRegistry`

| Before | Now |
| --- | --- |
| `createOrUpdateSourceFile(fileName, compilationSettings, scriptSnapshot, scriptKind)` | `createOrUpdateSourceFile(fileName, text)` |
| text supplied as `ts.IScriptSnapshot` | text supplied as a `string` |
| compiler options passed per call | set once via the constructor |
| constructed from a `TransactionalFileSystem` | constructed with `{ compilerOptions, files }` |

`ts.IScriptSnapshot`, `ts.ScriptSnapshot`, and `ts.DocumentRegistryBucketKey`
no longer exist. Compiler options move to the registry because tsgo resolves
them per project.

A returned tree is only valid until the next change to that file: cached trees
are dropped on every edit, because the underlying cache is keyed by snapshot and
stale nodes would otherwise survive.

### `getChildren` and `getLastToken` are free functions

Compiler nodes have no `getChildren`, `getChildCount`, `getChildAt`,
`getFirstToken`, or `getLastToken` methods. tsgo's AST stores only real nodes —
punctuation and keyword tokens, and the `SyntaxList` nodes ts-morph exposes, are
not in the tree.

`getChildren(node, sourceFile)` and `getLastToken(node, sourceFile)` from
`@ts-morph/common` rebuild them by scanning the gaps between stored children,
matching classic TypeScript's output exactly. Results are cached per node, since
ts-morph keys its wrapper cache on node identity.

### `TypeFormatFlags` is now `NodeBuilderFlags`

tsgo's `typeToString` takes `NodeBuilderFlags`; the separate `TypeFormatFlags`
enum has no counterpart. The name is kept as an alias, but the flag values
differ.

### `EditorSettings` is reduced

Now `{ tabSize?, insertSpaces?, trimTrailingWhitespace?, newLineCharacter? }` —
the settings tsgo's formatter actually accepts. Options like `indentStyle` and
`baseIndentSize` are gone.

### `EmitHint`

Retained for shape only. tsgo prints server-side and its `printNode` takes no
hint, so the value has no effect.

### Removed compiler options

`charset` no longer exists.

---

## Nodes behave differently

### `sourceFile.fileName` cannot be assigned

`fileName` (and most other source-file data) is a getter with no setter.
Assigning throws. `createMutableSourceFile(sourceFile, { fileName, version })`
returns a view that inherits from the real file and shadows those fields with
writable properties, leaving the original untouched and node identity intact.

### Binder internals are not on nodes

`.symbol`, `.locals`, and `.emitNode` are absent. Symbol lookups must go through
the checker (`getSymbolAtLocation`) instead of reading the property directly.

### Nodes are lazy views

Nodes are materialized on demand over a binary buffer and hold a circular
reference back to their source file. They are not plain objects and do not
survive a recursive deep clone.

---

## Language service

The methods below now come from tsgo (routed out of its internal language
service in the fork), and return **character offsets**, not LSP positions:

`formatDocument` · `formatDocumentRange` · `organizeImports` · `rename` ·
`getDefinition` · `getImplementations` · `getCodeFixes`

Two have no backend equivalent yet:

- **`getEditsForRefactor`** — refactors are not exposed.
- **`getIndentationAtPosition`** — no counterpart.

Rename and implementations resolve against a single project. Code fixes prepare
the auto-import registry, which makes the first call more expensive.

---

## Runtime and packaging

- Requires a runtime with WebAssembly and `node:wasi`.
- Ships a large (~43 MB) `.wasm` artifact.
- Single-threaded: one request runs to completion at a time.
- The compiler is no longer a plain-JS dependency, so environments that bundled
  `typescript` as source are affected.

---

## Still in flight

Not yet resolved, listed so they are not mistaken for finished work:

- **tsconfig parsing** — `parseJsonConfigFileContent` and
  `parseConfigFileTextToJson` have no tsgo equivalent (it exposes
  `parseConfigFile` on the API instead). These are the last two type errors in
  `packages/common`.
- **`packages/ts-morph`** — fallout unmeasured. `CompilerFactory` still calls the
  old registry signature, and `Project`, `ProjectContext`, `LanguageService`, and
  `main.ts` still reference the deleted hosts.
- **`packages/bootstrap`** — exists to expose `ts.Program`/`ts.LanguageService`
  with hosts, so it likely cannot survive in its current form.
- **`scripts/verification/validateCodeFences.ts`** — finds call sites by resolving
  the `ts.Node#getChildren` symbol, which no longer exists. The guard is still
  worth having (the free function is the expensive path) and needs reworking
  rather than deleting.
- **Custom module resolution** — to be restored by adding a resolution callback
  to the fork, as described above. Deferred until the rest of the migration is
  done.
