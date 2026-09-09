# tsgo-wasm seam

Runs the native TypeScript compiler (tsgo / TypeScript 7+) **in-process** inside
ts-morph via WebAssembly — no subprocess, no native addon, fully synchronous.

## Layout

- `submodules/typescript-go` — fork ([dsherret/TypeScript](https://github.com/dsherret/TypeScript), branch `migrate-tsmain`) with:
  - `tsc/cmd/tsgo-wasm` — a `GOOS=wasip1 -buildmode=c-shared` reactor exposing a
    synchronous `handle_request` export over the API server. Filesystem access is
    delegated to the JS host via `//go:wasmimport` callbacks; `lib.*.d.ts` are
    embedded. Single-threaded: one request runs to completion per call.
  - `tsc/internal/api/inprocess.go` — `InProcessServer`, a transport-less analogue of
    the STDIO server.
  - `packages/typescript/src/api/wasmChannel.ts` — `WasmChannel`, an
    in-process transport with the same `RpcChannel` surface as the subprocess
    `SyncRpcChannel`. `Client` accepts it via `ClientWasmOptions`, so the stock
    sync `API` runs over Wasm unchanged.
  - `packages/typescript/src/api/wasm/api.ts` — `createWasmAPI`, instantiates
    the reactor. The module is either supplied by the host or read from beside
    this one, through whatever the host offers without an import.
  - `packages/typescript/src/api/wasm/wasi.ts` — `createWasiImports`, a
    `wasi_snapshot_preview1` implementation written against the web platform
    only. `GOOS=wasip1` is why those imports exist at all; almost none of them
    are used, because the file system is delegated to JS through `ts_host`. This
    replaces `node:wasi` in **every** runtime, which is what lets one loader
    serve Node, Deno and the browser.
- `seam.mts` — re-exports `createInProcessApi()` from
  `packages/common/src/tsgo/inProcessApi.ts`, the single ts-morph-facing factory.
  Shaped around `@typescript/native-preview`'s `unstable/sync` `API` so the backend
  can later be swapped for the subprocess/native build for native performance.
- `proof.mts` — end-to-end check (parse from an in-memory FS, walk the AST,
  type-check) driven from this repo.
- `edit-loop.mts` — the manipulation primitive: edit text through the in-memory
  FS, report it via `updateSnapshot`, and observe the new text in both the AST
  and the checker. Also covers file creation and deletion.
- `getChildren.mts` — re-exports `getChildren()` / `getLastToken()` from
  `packages/common/src/tsgo/getChildren.ts`, which reconstructs the tokens and
  `SyntaxList` nodes that `forEachChild` omits. `getChildren-parity.mts` checks it
  against classic TypeScript's spans and order.
- `adapter-invariants.mts` — node identity is stable across `getChildren` calls,
  `getLastToken` matches classic, and a source file accepts `fileName`/`version`
  re-stamping.
- `language-service.mts` — formatting, organize-imports, and rename.
- `definitions.mts` — go-to-definition and find-implementations.
- `code-fixes.mts` — quick fixes for a span, filtered by diagnostic code.
- `document-registry.mts` — the tsgo-backed replacement for `ts.DocumentRegistry`.
- `tsconfig-resolver.mts` — tsconfig parsing through `createFileSystemAdapter`.
- `ambient-modules.mts` — `getAmbientModules`, restored by exposing the checker's
  existing implementation through the API.
- `custom-resolution.mts` — the module resolution callback: the host, not the
  compiler, decides where a specifier points (Deno's case).
- `ts-compat.mts` — the tsgo-backed `ts` namespace: the enums, guards and scanner
  utilities ts-morph reaches for are present and reverse-mappable.
- `deletion.mts` — a project built with files removed as it goes answers exactly
  as one opened with the files it ends up holding: file order, every import's
  resolution and every diagnostic. Reads the rollup bundle like `project.mts`, but
  without rebuilding it first, so build before running it.
- `bench-native-vs-wasm.mts` — the same workloads through the Wasm reactor and a
  native `tsgo` binary whose path is given on the command line. A measurement rather
  than a check, so it is not in the run list below.
- `browser/` — the browser acceptance test, and the browser documentation. See
  [browser/README.md](./browser/README.md): a Web Worker is required, and
  `await initializeWasm()` has to run before the first `Project`.
- `project.mts` — the ts-morph package itself: a real `Project` created, read
  through the wrappers and the checker, manipulated, renamed, formatted and
  emitted. Unlike the others this runs against the rollup bundles, because
  ts-morph's sources use extensionless relative imports that Node cannot resolve;
  it rebuilds them when they are older than their sources.

The adapter itself lives in **`packages/common/src/tsgo`** (`getChildren`,
`getLastToken`, `createFileSystemAdapter`, `DocumentRegistry`,
`createInProcessApi`); the scripts here drive it end-to-end.

All but `project.mts` and `deletion.mts` are **backend and adapter smoke tests**
rather than migration coverage. The real gate is the packages' own mocha suites,
and all three pass: `packages/ts-morph` (4520, 2 pending), `packages/common` (468)
and `packages/bootstrap` (85, 4 pending).

## Build & run

```sh
# build the wasm (needs the Go toolchain; see the submodule's tsc/go.mod)
node submodules/typescript-go/packages/typescript/scripts/build-wasm.mjs

# prove it end-to-end
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/proof.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/edit-loop.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/getChildren-parity.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/adapter-invariants.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/language-service.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/definitions.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/code-fixes.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/document-registry.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/tsconfig-resolver.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/ambient-modules.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/custom-resolution.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/ts-compat.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/project.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/deletion.mts

# prove it in a browser (needs a built repo and a Chrome or Edge on the machine)
node tsgo-wasm/browser/run.mjs

# type check, then run the tests. The type check is tsgo's: ts-morph has no npm
# `typescript`, and `.tsgo/tsgo` is what the rollup build compiles out of the
# submodule, so a build has to have run at least once
(cd packages/common && ../../.tsgo/tsgo --noEmit -p tsconfig.json && deno task test)
(cd packages/ts-morph && ../../.tsgo/tsgo --noEmit -p tsconfig.json && deno task test)

# the bundle catches what the type check cannot: a member reached off the tsgo
# namespace that does not exist is only a rollup `is not exported by
# src/tsgo/ts.ts` warning
(cd packages/common && npx rollup --config)
```

## Why this shape

The seam intentionally mirrors the `unstable/sync` API surface:

- **AST** comes back as real in-process `unstable/ast` nodes (`kind`, `pos`/`end`,
  `parent`, `forEachChild`, `getText`) — the same shapes ts-morph's wrappers
  already model.
- **Types/symbols/signatures/diagnostics** come from a synchronous `checker`
  nearly 1:1 with the classic compiler API.

So swapping to the official spawn/native transport later is a channel swap, not a
rewrite — and buys native performance without changing ts-morph's public API.

## What is already de-risked

- **Edit → reparse** works (`edit-loop.mts`): text edits, file creation, and
  deletion all propagate to the AST and the checker. This is the primitive the
  manipulation engine is built on.
- **`getChildren()` + `SyntaxList`** are reconstructible client-side, matching
  classic TypeScript's spans, order and token parents — verified over a
  stress-test source plus doc comments, inline/leading/trailing comments and JSX
  (509 nodes, 129 distinct kinds mapping 1:1). This was the largest node-level
  gap, since `forEachChild` alone omits tokens, JSDoc and syntax lists. One
  difference remains, and it comes from tsgo's AST rather than from the
  reconstruction: a doc comment's prose is a `JSDocText` child where classic
  keeps it as a plain string.
- **Emit and references are already in the API** — `emit`, `emitToString`,
  `getDeclarationEmit`, `getJavaScriptEmit`, `getImportAdderEdits`,
  `getReferencedSymbolsForNode` and `getReferencesToSymbolInFile` all come from
  upstream, so nothing had to be added for them. Where the fork is genuinely ahead is
  the checker and language-service surface below.

See [BREAKING-CHANGES.md](./BREAKING-CHANGES.md) for the running list of what
this changes for users.

## Compatibility findings

ts-morph funnels **all** compiler access through one import
(`packages/common/src/typescript/public.ts`, which re-exports
`packages/common/src/tsgo/ts.ts`) and **all** parsing through the
`DocumentRegistry` (`packages/common/src/tsgo/documentRegistry.ts`, whose
`parseSourceFileText` is a full reparse — there is no incremental update). That is
the swap point.

What ts-morph needs that the new AST does not give directly:

| Need                                                          | Status                                                                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getChildren()` + `SyntaxList`                                | **Solved** — parity with classic apart from the one tsgo AST difference above (six `JSDocText` spans in the parity fixture), cached for node identity  |
| `getLastToken()`                                              | **Solved** — same machinery                                                                                                                            |
| Reparse after edit                                            | **Solved** — `edit-loop.mts`                                                                                                                           |
| Mutable `sourceFile.fileName`                                 | **Solved** — `setSourceFileProperty` shadows the getter-only field with a writable own property on the file itself.                                    |
| `sourceFile.version` stamping, `node.parent` assignment       | Work as-is                                                                                                                                             |
| `.symbol` / `.locals` / `.emitNode`                           | **Absent** — binder internals are not exposed. Route through the checker (`getSymbolAtLocation`) instead.                                              |
| `.imports` / `.scriptKind` / `.modifiers`                     | Present                                                                                                                                                |
| Recursive `deepClone` of a SourceFile (`createDocumentCache`) | **Removed** — nodes are lazy `DataView` views with a circular `_sourceFile` back-reference, so `createDocumentCache` is gone (BREAKING-CHANGES.md §4). |

Checker coverage is complete: every `ts.TypeChecker` method ts-morph calls is exposed,
and `getAmbientModules` is among them. The fork added `getAwaitedType`,
`getSymbolOfDeclaration` and `symbolToString`, plus `getExportedSymbolsOfFiles`, a batch
request that `getExportedDeclarations` uses; `getFullyQualifiedName` and
`getSymbolsInScope` were already upstream.

**The LanguageService gap is not missing functionality.** ts-morph uses 14
LanguageService methods, and tsgo already implements the equivalents in Go under
`internal/ls`; they were simply not routed through the API session's method
table. Because this repo owns the fork, exposing them is additive work in
`internal/api` (mapping the LSP-shaped types to the API's offset-based ones).

Now exposed on `Project` (see `tsc/internal/api/session_ls.go`): `formatDocument`,
`formatDocumentRange`, `organizeImports`, `rename`, `getDefinition`,
`getImplementations`, `getCodeFixes` and `getCombinedCodeFix`; `getAmbientModules` goes
the same way on the Go side but reaches the client as a checker method. Rename and
implementations pass a nil
`CrossProjectOrchestrator`, which selects the single-project path — the API's
model. Code fixes prepare the snapshot's auto-import registry, without which
import-adding fixes fail.

That covers the LanguageService methods ts-morph needs, other than
`getEditsForRefactor` (refactors) and `getIndentationAtPosition`, which have no
direct equivalent yet.

## Remaining work

The integration is done: `@ts-morph/common`'s `ts` layer sits on the seam, reparse
after an edit goes through the `DocumentRegistry`, and `Type`/`Symbol`/`Signature`
are handles into the seam's checker. What is still open is tracked in
[TODO.md](./TODO.md); refactors are not among it, being removed rather than pending
(BREAKING-CHANGES.md §4).
