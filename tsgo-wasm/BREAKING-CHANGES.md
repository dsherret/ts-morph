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

### Symbol tables and node internals tsgo does not expose

`Symbol#getGlobalExport`, `Symbol#getGlobalExportOrThrow` and
`Symbol#getGlobalExports` are removed. tsgo's `Symbol` exposes `getMembers()` and
`getExports()` and has no `globalExports` table, so UMD global augmentations
cannot be enumerated.

`Node#getLocal`, `Node#getLocalOrThrow` and `Node#getLocals` are removed, along
with the `ts.SymbolTable` type. These read the binder's `locals` table straight
off a compiler node; tsgo keeps binder state on the server and never sends it.

### Signature documentation

`Signature#getDocumentationComments` and `Signature#getJsDocTags` are removed.
tsgo hangs documentation and JS doc tags off `Symbol` (`getDocumentationComment`,
`getJsDocTags`), not off a signature. `Symbol#getJsDocTags` is unaffected.

### Node details tsgo does not record

- `SourceFile#getLanguageVersion` — a parsed file carries its script kind and
  language variant, but not the script target it was parsed with, so this reports
  the project's configured `target` (defaulting to `ScriptTarget.Latest`) and
  follows later changes to the compiler options.
- `JSDocNullableType#isPostfix` and `JSDocNonNullableType#isPostfix` — tsgo does
  not record whether `?`/`!` was written before or after the type.
- `OutputFile#getWriteByteOrderMark` — already removed; `Directory#emit` no
  longer prepends a byte order mark to emitted text.

### `Type#getTargetType` returns a plain `Type`

`Type#getTargetType()` and `Type#getTargetTypeOrThrow()` returned
`Type<ts.GenericType>`. tsgo's `TypeReference.getTarget()` is typed as `Type`, so
the wrapper no longer narrows its compiler type. The runtime value is unchanged.

### `readDirectory` and the TypeScript file-matching internals

`readDirectory`, `matchFiles`, `getFileMatcherPatterns`, `FileMatcherPatterns`
and `FileSystemEntries` are removed from `@ts-morph/common`.

They were thin wrappers over `ts.matchFiles` / `ts.getFileMatcherPatterns` —
unexported TypeScript internals reached through `(ts as any)`. tsgo exposes
neither, so all three evaluated to `undefined` and every call threw a
`TypeError`. Nothing in the repo used them: `readDirectory` was never in the
`tsconfig` barrel, and tsconfig include/exclude globbing is now tsgo's job, done
inside `parseConfigFile`.

`getEmitModuleResolutionKind` survives, reimplemented in
`packages/common/src/typescript/tsInternal.ts` against tsgo's rules rather than
forwarded to the compiler. **Its results differ**, because tsgo's
`CompilerOptions.GetModuleResolutionKind` differs:

- `Classic` and `Node10` are no longer returned. They are treated as *unset* and
  resolved from the module kind, so an explicit `moduleResolution: "classic"`
  now answers `Bundler`.
- With no module kind and no target, the answer is `Bundler` rather than
  `Classic`.
- `Node16`, `Node18` and `Node20` module kinds answer `Node16`; `NodeNext`
  answers `NodeNext`.

### Compiler options a `tsconfig.json` cannot express are dropped, not blanked

`TsConfigResolver#getErrors` reports the real parse diagnostics again — the
protocol's `parseConfigFile` response carries them — and a `tsconfig.json` whose
syntax does not parse throws, as it always did. What changed is the options
object: where TypeScript kept the key with an `undefined` value for an option it
could not use (`{ "target": "FUN" }` gave `{ target: undefined }`), tsgo leaves
the key out entirely. The accompanying diagnostic is unchanged.

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

A returned tree for an *edited* file is only valid until the next change to that
file. Files the edit did not touch keep their nodes: the source file cache
carries their entries across snapshots, which is what preserves wrapper identity
for the rest of the project.

`getSourceFileVersion` returns `undefined` for a file the registry does not know
(a never-edited file is version `"0"`, so an unknown one must not report one),
and every method throws after `dispose()`.

A `Type`, `Symbol` or `Signature` is a handle into the snapshot whose checker
produced it, where classic TypeScript's were plain objects that stayed readable
forever. The registry keeps a superseded snapshot alive when the checker answered
from it, so a type obtained before a manipulation still answers questions after
it, but only the two most recent such snapshots are kept — every one pins a
program and a checker inside the wasm module. A type held across more than that
many checker generations throws `snapshot N not found`; re-read it from the node
instead.

### `getChildren` and `getLastToken` are free functions

Compiler nodes have no `getChildren`, `getChildCount`, `getChildAt`,
`getFirstToken`, or `getLastToken` methods. tsgo's AST stores only real nodes —
punctuation and keyword tokens, and the `SyntaxList` nodes ts-morph exposes, are
not in the tree.

`getChildren(node, sourceFile)` and `getLastToken(node, sourceFile)` from
`@ts-morph/common` rebuild them by scanning the gaps between stored children.
Results are cached per node, since ts-morph keys its wrapper cache on node
identity, and share the source file's own token cache so a token reached through
`getTokenAtPosition` is the same object.

Output matches classic TypeScript's spans, order and token parents, with two
exceptions that come from tsgo's AST rather than from the reconstruction:

- A `JSDoc` node's `pos` is its full start (back to the previous node's end,
  comments included) rather than the position of the doc comment itself. Its
  `end` and `getStart()` agree with classic.
- A doc comment's prose is a `JSDocText` child node; classic keeps plain prose as
  a string on `JSDoc.comment`, so it is not a child there.

### `TypeFormatFlags` is now `NodeBuilderFlags`

tsgo's `typeToString` takes `NodeBuilderFlags`; the separate `TypeFormatFlags`
enum has no counterpart. The name is kept as an alias, but it is not a faithful
stand-in.

Six members are gone: `AddUndefined`, `WriteArrowStyleSignature`, `InArrayType`,
`InElementType`, `InFirstTypeArgument`, `NodeBuilderFlagsMask`. Five of their
values are live in `NodeBuilderFlags` under different meanings, so a numeric
literal or a persisted bitmask silently changes what it does:

| value | was (`TypeFormatFlags`) | now (`NodeBuilderFlags`) |
| --- | --- | --- |
| 131072 | `AddUndefined` | `AllowAnonymousIdentifier` |
| 262144 | `WriteArrowStyleSignature` | `AllowEmptyUnionOrIntersection` |
| 524288 | `InArrayType` | `AllowEmptyTuple` |
| 2097152 | `InElementType` | `AllowEmptyIndexInfoType` |
| 4194304 | `InFirstTypeArgument` | `InObjectTypeLiteral` |

Because it is an alias rather than a distinct enum, `TypeFormatFlags` and
`NodeBuilderFlags` are now the same nominal type and mutually assignable. The
members ts-morph passes by default have identical values in both.

### `EditorSettings` and `FormatCodeSettings` are reduced

`EditorSettings` is now `{ tabSize?, insertSpaces?, trimTrailingWhitespace? }` —
exactly tsgo's `FormattingOptions`, and nothing else. `FormatCodeSettings` adds
nothing to it.

Note the rename: `convertTabsToSpaces` is now `insertSpaces`. They mean the same
thing with the same polarity, so a value carries over unchanged, but the old name
no longer compiles.

Gone, because tsgo's formatter cannot express them: `indentStyle`, `indentSize`,
`baseIndentSize`, `newLineCharacter`, `semicolons`, and the whole
`insertSpaceAfter...` / `insertSpaceBefore...` / `placeOpenBraceOnNewLineFor...`
family. Neither interface has an index signature, so passing a removed option is
a compile error rather than a silent no-op.

Two options survive as ts-morph's own, applied by ts-morph rather than by the
formatter: `ensureNewLineAtEndOfFile` and
`insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces` (which drives ts-morph's
structure printers). Line endings are normalized by ts-morph after formatting,
from its manipulation settings.

### `EmitHint`

Retained for shape only. tsgo prints server-side and its `printNode` takes no
hint, so the value has no effect. It is a `const` object rather than an enum, so
it is not a nominal type: any numeric literal in range is assignable where a
member reference used to be required.

### Removed compiler options

`charset` no longer exists. `CompilerOptionsContainer#getEncoding()` therefore
always returns `"utf-8"`.

### Diagnostics

`Diagnostic#getMessageText()` now always returns a `string`. tsgo puts the
message on `text` and nests any elaborating messages under `messageChain`, so a
chain no longer arrives in place of the text — use the new
`Diagnostic#getMessageChain()`. `Diagnostic#getSource()` is gone; tsgo does not
carry a source.

`DiagnosticMessageChain` now wraps a `Diagnostic` (tsgo has no distinct chain
type) and `getNext()` reads `messageChain` rather than `next`.

`ts.getPreEmitDiagnostics(program, sourceFile?)` is kept, but the adapter
assembles it: tsgo reports config-file, program, syntactic, global and semantic
diagnostics separately, and this concatenates them in that order. It takes no
cancellation token.

### Emit output

`EmitOutput#getOutputFiles()` still returns wrappers, but the underlying
`emitOutput.outputFiles` is a `ReadonlyMap` keyed by output path, not an array,
and the path is the key rather than a field on the file.
`OutputFile#getWriteByteOrderMark()` is gone — tsgo does not model a byte order
mark.

### Removed node wrappers

`SyntaxKind.JSDocTag` (classic's catch-all) is now `SyntaxKind.JSDocUnknownTag`;
the `JSDocUnknownTag` wrapper is still reachable under the new kind. The kinds
`CommaListExpression`, `JSDocAuthorTag`, `JSDocClassTag`, `JSDocEnumTag`,
`JSDocFunctionType`, `JSDocMemberName`, `JSDocNamepathType` and
`JSDocUnknownType` do not exist in tsgo, so their wrappers are unreachable.

---

## Nodes behave differently

### `sourceFile.fileName` cannot be assigned

`fileName` (and most other source-file data) is a getter with no setter.
Assigning throws. `setSourceFileProperty(sourceFile, "fileName", value)` defines
an own data property on the file that shadows the getter.

It re-stamps the file itself rather than returning a view of it. A prototype view
does not work: `getSourceFile()` returns a stored field, so every node would keep
reporting the original name; `path` would disagree with `fileName` on the same
object; the file's memo fields would be duplicated onto the view; and because
`getChildren`'s caches are keyed by object identity, a view mints a second set of
synthesized tokens and `SyntaxList`s for the same file.

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

### `LanguageService` is the tsgo project

There is no `ts.LanguageService`. Formatting, organize-imports, rename,
definitions, implementations and code fixes are methods on the session's
project, and the program and checker hang off it too, so
`LanguageService#compilerObject` returns that project.
`ProjectContext#getSourceFileContainer()` and `#getModuleResolutionHost()` are
gone with the hosts they fed, and so is `Project#getModuleResolutionHost()`.

### Language service operations that are gone

- **`LanguageService#getEditsForRefactor`** and the **`RefactorEditInfo`**
  wrapper — tsgo exposes no refactors.
- **`LanguageService#getCombinedCodeFix`** and the **`CombinedCodeActions`**
  wrapper — tsgo does not group fixes into fix-alls, so there is no `fixId` to
  ask for. **`SourceFile#fixUnusedIdentifiers`** and
  **`SourceFile#fixMissingImports`** were built on it and are gone too;
  `fixMissingImports` is restorable on tsgo's `getImportAdderEdits`, which takes
  the symbols to import rather than a fix id.
- **`LanguageService#getIdentationAtPosition`** — no smart-indentation service.
  `Node#getIndentationLevel()` survives, but now measures the indentation the
  node's line actually has instead of the indentation the formatter would give
  it; the two differ only for text that is already mis-indented.
- **`CodeFixAction#getFixName/getFixId/getFixAllDescription`** — tsgo returns a
  description and the edits, nothing else.
- **`ImplementationLocation#getKind/getDisplayParts`**,
  **`ReferencedSymbolDefinitionInfo#getDisplayParts`** and the
  **`SymbolDisplayPart`** wrapper — tsgo does not build display parts, and
  reports an implementation as a bare file span.
- **`TypeChecker#getAmbientModules`** (and `Project#getAmbientModule(s)` /
  `getAmbientModuleOrThrow`), **`#getAwaitedType`** (and `Type#getAwaitedType`),
  **`#getFullyQualifiedName`** (and `Symbol#getFullyQualifiedName`),
  **`#getExportSymbolOfSymbol`** (and `Symbol#getExportSymbol`) and
  **`#getSymbolsInScope`** (and `Node#getSymbolsInScope`) — tsgo's checker has
  none of these.
- **`ProjectOptions.resolutionHost`** and the `ResolutionHostFactory` type —
  see "Custom module resolution" above.
- **`CompilerOptions.charset`** — no tsgo counterpart; files are read as utf-8.

### Language service operations whose signature changed

- **`LanguageService#findRenameLocations(node, newName, options)`** — `newName`
  is now required, because tsgo computes a rename as the edits that perform it.
  The `prefixText`/`suffixText` a `RenameLocation` reports are recovered from
  the edit's replacement text.
- **`LanguageService#findReferencesAtPosition`** resolves from the node at the
  position, because that is what tsgo's `getReferencedSymbolsForNode` takes; a
  position with no node under it yields no references. A reference's
  `isDefinition()` is now "this reference is the entry's definition node", and
  `isWriteAccess()` is always false — tsgo does not classify a reference.
  A definition's `getKind()` is derived from the definition symbol's flags; see
  `ts.ScriptElementKind` for the members that survive.
- **`LanguageService#organizeImports(filePathOrSourceFile, mode?)`** and
  **`SourceFile#organizeImports()`** — the format settings and user preferences
  parameters are gone; tsgo takes only a mode.
- **`LanguageService#getCodeFixesAtPosition(file, start, end, errorCodes)`** —
  the format settings and user preferences parameters are gone.
- **`LanguageService#getSuggestionDiagnostics`** and
  **`Program#getSyntacticDiagnostics`/`getDeclarationDiagnostics`** return
  `Diagnostic`, not `DiagnosticWithLocation`; tsgo has no separate type.

### Emit

- **`ProgramEmitOptions.writeFile`** — tsgo emits inside the compiler and
  reports the names it wrote; there is no callback to intercept a write with.
  `Program#emit()` and `#emitSync()` therefore differ only in whether the
  targeted-file write is awaited. Use `emitToMemory()` to get the text.
- **`EmitOptionsBase.customTransformers`** — tsgo's emitter does not run
  JavaScript transforms.
- A `targetSourceFile` emit goes through tsgo's per-file `getJavaScriptEmit` /
  `getDeclarationEmit` and writes the result out itself, because a project emit
  cannot be restricted to one file.

### Printing

`printNode` is no longer a free function: printing runs on the server, so it
needs the session the node came from and is only reachable as `Node#print()`.
`PrintNodeOptions` loses `removeComments`, `emitHint` and `scriptKind` and gains
tsgo's `preserveSourceNewlines`, `neverAsciiEscape` and
`terminateUnterminatedLiterals`; `newLineKind` is applied by ts-morph to the
printed text rather than by the printer.

### `Project#formatDiagnosticsWithColorAndContext` is plain text

tsgo has no `formatDiagnosticsWithColorAndContext`, so ts-morph formats the
diagnostics itself. The source line, the caret and the ANSI colouring are gone;
what remains is `path(line,column): category TScode: message`.

### `TypeScriptVersionChecker` is gone

There is no `ts.version` to compare against — the compiler is a wasm build of
tsgo, not a versioned npm package.

### `Type#getConstraint()` and `Type#getDefault()` are narrower

tsgo resolves a constraint only for type parameters and substitution types, and
a default only for type parameters. An indexed access, index or conditional type
now returns `undefined` from `getConstraint()` where the `typescript` package
returned a type.

### `Diagnostic#getSourceFile()` only sees wrapped files

tsgo reports a diagnostic's file by name rather than handing back the parsed
file, so this resolves the name against the files the project has wrapped. A
diagnostic on a file the program pulled in but the project never added (a lib
file, an implicit dependency) yields `undefined` where the `typescript` package
returned a `SourceFile`.

Rename and implementations resolve against a single project. Code fixes prepare
the auto-import registry, which makes the first call more expensive.

The session declares no LSP client capabilities, so `WorkspaceEdit.DocumentChanges`
is never populated — the API returns plain per-file edit lists and cannot carry
versioned edits or create/rename/delete-file operations. Rename fails with an
error rather than returning a partial edit set if it ever touches a file outside
the program, and a code fix that does so is dropped whole rather than applied in
part.

---

## `@ts-morph/bootstrap`

The package's whole purpose is handing back raw compiler objects, so it takes the
brunt of the compiler's own API changes.

### The program is the project's, and is not created

`Project#createProgram()` no longer creates anything and no longer takes
`ts.CreateProgramOptions`: tsgo keeps one program per project and updates it as
files change, so the call returns the program for the project's current state.
`configFileParsingDiagnostics` can no longer be injected into it — the
diagnostics from the project's own `tsconfig.json` are on the new
`Project#getConfigFileParsingDiagnostics()` instead. (The program's own
`getConfigFileParsingDiagnostics()` answers for the session's synthetic config,
not the user's.)

### `getLanguageService()` returns the tsgo project

Same change as ts-morph's: tsgo has no `LanguageService`, and the operations hang
off the compiler's project. See "`LanguageService` is the tsgo project".

### Removed with the compiler hosts

`ProjectOptions#resolutionHost`, `ProjectOptions#isKnownTypesPackageName`,
`Project#getModuleResolutionHost()`, and the `ResolutionHost`,
`ResolutionHostFactory` and `ResolutionHosts` re-exports. tsgo resolves modules
and type reference directives inside the compiler with no host callback to
override — the same gap as "Custom module resolution".

### `updateSourceFile(sourceFile)` re-parses the text

tsgo owns parsing, and a tree it did not produce cannot be put into a project, so
the overload taking a source file now re-creates the file from its `text` and
returns the new object rather than storing the one it was given.

### `scriptKind` has no effect

`SourceFileOptions#scriptKind` is accepted so existing calls compile, but tsgo
derives the script kind from the file extension and cannot be told otherwise.

### `resolveSourceFileDependencies()` returns the files it added

It used to create a program for its side effect of populating the source file
container through the compiler host. There is no such callback now, so it walks
`program.getSourceFileNames()` until the program stops growing, and returns the
files that walk added.

### The encoding is always utf-8

`CompilerOptions#charset` is gone from tsgo, and it was the only thing
`ProjectOptions#compilerOptions` fed the file reads.

---

## Runtime and packaging

- Requires a runtime with WebAssembly and `node:wasi`.
- Ships a large (~43 MB) `.wasm` artifact.
- Single-threaded: one request runs to completion at a time.
- The compiler is no longer a plain-JS dependency, so environments that bundled
  `typescript` as source are affected.
- `@ts-morph/common`'s bundle now ships `dist/typescript.wasm` beside
  `dist/ts-morph-common.js`, emitted by `packages/common/rollup.config.mjs`. The
  wasm loader is inlined into the bundle, which invalidates its in-package
  relative path to the reactor, so it falls back to a copy sitting next to
  whatever module loads it.
- That same config resolves the tsgo client's package-internal `#enums/*`,
  `#getExePath` and `#vscode-jsonrpc/node` specifiers. Without it the bundle
  loads and immediately throws `Cannot find module '#enums/modifierFlags'`,
  because those are only resolvable through the tsgo package's own `imports`
  map, which no longer applies once its modules are inlined here.

---

## Removed public API, in full

Verified absent from shipped source (grep over `packages/*/src` excluding tests
returns no hits). The tests covering each are preserved rather than deleted, so
the record survives: most now fail, and the four whose imports would abort the
whole mocha run at module load are quarantined under
`packages/ts-morph/src/tests/removed-capabilities/` and excluded in `.mocharc.yml`.

| Removed | Was on | Why |
|---|---|---|
| `Node#transform`, `TransformTraversalControl` | `Node` | needs the printer, transform pipeline, and node factory tsgo does not expose |
| `printNode` | utils | same |
| `ResolutionHost`, `ResolutionHostFactory`, `ResolutionHosts` | `Project` | tsgo resolves modules internally, with no hook (recoverable — see above) |
| `Project#getModuleResolutionHost` | `Project` | the host model is gone |
| `getSymbolsInScope`, `getLocals`, `getLocal`, `getLocalOrThrow` | `Node`, `TypeChecker` | binder internals (`.locals`) are not on tsgo nodes |
| `getAmbientModules` | `TypeChecker` | no counterpart |
| `getAwaitedType` | `TypeChecker` | no counterpart |
| `getGlobalExports`, `getGlobalExport`, `getGlobalExportOrThrow`, `getExportSymbol` | `Symbol` | no counterpart |
| `fixMissingImports`, `fixUnusedIdentifiers` | `SourceFile` | superseded by `getCodeFixes` / `getImportAdderEdits`, with different shapes |
| `getEditsForRefactor`, `RefactorEditInfo` | `LanguageService` | tsgo exposes no refactor surface |
| `getCombinedCodeFix`, `CombinedCodeActions` | `LanguageService` | no counterpart |
| `getIndentationAtPosition` | `LanguageService` | no counterpart |
| `getDocumentationComments`, `getJsDocTags` | `Signature` | no counterpart on signatures |
| `getDisplayParts` | `Identifier` results | display parts are not returned |
| `getFixName`, `getFixId`, `getFixAllDescription` | code fix results | tsgo returns a description only |
| `writeByteOrderMark` | emit output | not reported |
| `Diagnostic#getSource` | `Diagnostic` | not reported |
| `emit` / `emitSync` write callback | `Program` | emit is server-side |
| `JSDocFunctionType` and the other unproduced JSDoc kinds | AST wrappers | tsgo's parser emits no such kinds |
| `ScriptTarget.ES3`, `ScriptTarget.ES5` | enum | removed from tsgo |
| `ModuleResolutionKind.NodeJs` | enum | removed from tsgo |
| `IndentStyle` | enum | removed from tsgo |
| `ts.createSourceFile`, `ts.ScriptSnapshot`, `ts.resolveModuleName` | `ts` namespace | tsgo parses and resolves server-side |

### Renamed enum members

The classic names are kept as aliases where they are part of ts-morph's own
public surface, but **the numeric values changed**, which matters for code that
hard-codes them:

| Member | Classic | tsgo |
|---|---|---|
| `NewLineKind.CarriageReturnLineFeed` | `0` | `1` (aliased to `CRLF`) |
| `NewLineKind.LineFeed` | `1` | `2` (aliased to `LF`) |
| — | — | `NewLineKind.None = 0` is new |
| `SyntaxKind.EndOfFileToken` | — | renamed `EndOfFile` |

Passing a hard-coded `0` for a newline kind now means `None`;
`newLineKindToString` rejects it with an explanatory error rather than silently
emitting the wrong ending.

### Known regression, not yet fixed

`TsConfigResolver#getErrors()` returns `[]` unconditionally, so invalid tsconfig
options are dropped silently and `Project#getConfigFileParsingDiagnostics()` is
always empty. tsgo does surface these through `parseConfigFile` and the program's
own config diagnostics, so this is fixable and should be fixed.

## Still in flight

Not yet resolved, listed so they are not mistaken for finished work:

- **tsconfig parsing** — shipped: `TsConfigResolver` now goes through the API's
  `parseConfigFile`. What users lose is `ts.parseJsonConfigFileContent`,
  `ts.parseConfigFileTextToJson` and `ts.ParseConfigHost`, none of which have a
  tsgo equivalent; `getTsParseConfigHost` is gone with them. `packages/common`
  type-checks clean.
- **Packaging** — `packages/common/src/tsgo/*` imports the tsgo client out of
  `submodules/typescript-go/_packages/native-preview/dist`, which is gitignored,
  untracked build output, and neither package declares a dependency on
  `@typescript/native-preview`. A fresh clone cannot build `@ts-morph/common`
  until the client and the `.wasm` are consumed as a declared dependency (or
  vendored under a tracked path). `packages/common/tsconfig.json` also still sets
  `rootDir: ./src` while those imports reach outside it — invisible under
  `--noEmit`, fatal on a real emit.
- **`packages/ts-morph` source** — type-checks clean, and `tsgo-wasm/project.mts`
  now drives a real `Project` end to end (create, read, checker, manipulate,
  rename, format, emit) against the tsgo session. It runs against the rollup
  bundles, because ts-morph's sources use extensionless relative imports that
  Node cannot resolve directly; the script rebuilds them when they are stale.
  `packages/ts-morph/src/tests` still has **196 type errors** across 25 files,
  every one of them a test of an API this migration removed — `printNode`,
  `Node#transform`/`TransformationContext`, `SourceFile#getLanguageVersion`,
  `Node#getLocalOrThrow`, `Symbol#getGlobalExportOrThrow`,
  `CodeFixAction#getFixAllDescription`, `JSDocFunctionType`, `ts.NodeFactory`,
  `ts.ResolvedModule`. Deleting those cases is the next body of work.
  Three known runtime gaps in the seam:
  the `DocumentRegistry` owns a purely virtual file system seeded with a
  synthetic `/tsconfig.json`, so a project rooted anywhere else (any Windows
  path, anything with a `node_modules`) will not resolve modules until the
  registry reads through `createFileSystemAdapter`; the registry is built once
  from the compiler options and is not rebuilt when
  `CompilerOptionsContainer#onModified` fires; and `SourceFileCreateOptions.scriptKind`
  is now accepted and ignored, because tsgo derives the script kind from the file
  extension — it should be removed from the public surface.
- **`NoSubstitutionTemplateLiteral`'s position in the AST** — tsgo puts it
  straight on `ExpressionBase` rather than on the primary-expression chain,
  unlike the `typescript` package, which would leave ts-morph's
  `LiteralExpression` (a `PrimaryExpression`) unable to describe it. It is
  restated on that chain in `packages/common/src/tsgo/ts.ts`, along with the
  four unions that name it (`LiteralExpression`, `TemplateLiteral`,
  `StringLiteralLike`, `PropertyName`). The real fix is in the fork's generated
  AST — `NoSubstitutionTemplateLiteral` should embed `LiteralExpressionBase`
  like every other literal — after which the restatement can go.
- **`getChildren-parity.mts` no longer fails on every mismatch** — it gained an
  `alignKnownAstDivergence()` carve-out for two documented cases (JSDoc nodes
  whose `pos` is the full start, and `JSDocText` prose nodes). It reclassifies 9
  span mismatches as non-failing divergences. The carve-out now returns the
  aligned children and the walk recurses through them, so only the diverging
  child list itself goes unverified, not the subtree below it.
- **`packages/bootstrap`** — its source is migrated: `SourceFileCache` now owns a
  tsgo `DocumentRegistry` built over `createFileSystemAdapter`, and `Project`
  takes its program, its language service and its lib files from that session.
  `src` type-checks clean and the package loads again (it previously failed at
  import on `createHosts`), so its suite runs: **41 passing, 43 failing**, and
  `src/tests/projectTests.ts` still has **42 type errors**. Everything left is a
  compiler API the migration removed, and the test file is frozen, so it was left
  as it is. What the remaining failures need:
  - `Program#getSourceFiles()` (11 tests) and `Program#getTypeChecker()` (5) —
    tsgo's program has `getSourceFileNames()`/`getSourceFile(name)` and hangs the
    checker off the *project*, so both are one-line conveniences that only the
    tsgo client itself can add.
  - `LanguageService#findRenameLocations`/`getDefinitionAtPosition` (4) — spelled
    `rename` and `getDefinition` on the tsgo project, with different shapes; see
    "Language service operations whose signature changed".
  - `Project#getModuleResolutionHost()` (12) and `ProjectOptions#resolutionHost`
    — removed with the compiler hosts.
  - `ts.ScriptSnapshot`, `ts.createSourceFile` (2), `SourceFile#languageVersion`
    (2), `Diagnostic#messageText` (1), `skipLoadingLibFiles`' diagnostic count
    (2, tsgo reports 11 where TypeScript 5 reported 10).
- **Custom module resolution** — to be restored by adding a resolution callback
  to the fork, as described above. Deferred until the rest of the migration is
  done.
