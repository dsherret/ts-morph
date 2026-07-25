# tsgo-wasm seam

Runs the native TypeScript compiler (tsgo / TypeScript 7+) **in-process** inside
ts-morph via WebAssembly — no subprocess, no native addon, fully synchronous.

## Layout

- `submodules/typescript-go` — fork ([dsherret/typescript-go](https://github.com/dsherret/typescript-go), branch `ts-go`) with:
  - `cmd/tsgo-wasm` — a `GOOS=wasip1 -buildmode=c-shared` reactor exposing a
    synchronous `handle_request` export over the API server. Filesystem access is
    delegated to the JS host via `//go:wasmimport` callbacks; `lib.*.d.ts` are
    embedded. Single-threaded: one request runs to completion per call.
  - `internal/api/inprocess.go` — `InProcessServer`, a transport-less analogue of
    the STDIO server.
  - `_packages/native-preview/src/api/wasmChannel.ts` — `WasmChannel`, an
    in-process transport with the same `RpcChannel` surface as the subprocess
    `SyncRpcChannel`. `Client` accepts it via `ClientWasmOptions`, so the stock
    sync `API` runs over Wasm unchanged.
  - `_packages/native-preview/src/api/wasm/node.ts` — `createWasmAPI`, instantiates
    the reactor with `node:wasi`.
- `seam.mts` — `createInProcessApi()`, the single ts-morph-facing factory. Shaped
  around `@typescript/native-preview`'s `unstable/sync` `API` so the backend can
  later be swapped for the subprocess/native build for native performance.
- `proof.mts` — end-to-end check (parse from an in-memory FS, walk the AST,
  type-check) driven from this repo.
- `edit-loop.mts` — the manipulation primitive: edit text through the in-memory
  FS, report it via `updateSnapshot`, and observe the new text in both the AST
  and the checker. Also covers file creation and deletion.
- `getChildren.mts` / `getChildren-parity.mts` — `getChildren()` for the new AST,
  reconstructing tokens and `SyntaxList` nodes that `forEachChild` omits.

## Build & run

```sh
# build the wasm (needs the Go toolchain; see submodule go.mod)
node submodules/typescript-go/_scripts/build-wasm.mjs

# prove it end-to-end
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/proof.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/edit-loop.mts
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/getChildren-parity.mts
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
- **`getChildren()` + `SyntaxList`** are reconstructible client-side with *exact*
  parity against classic TypeScript — verified over a stress-test source (311
  nodes, 106 distinct kinds mapping 1:1). This was the largest node-level gap,
  since `forEachChild` alone omits tokens and syntax lists.
- The submodule is **ahead of npm `typescript@7.0.2`** and already exposes `emit`,
  `emitToString`, `getDeclarationEmit`, `getJavaScriptEmit`, and
  `getImportAdderEdits`, plus references (`getReferencedSymbolsForNode`,
  `getReferencesToSymbolInFile`).

## Compatibility findings

ts-morph funnels **all** compiler access through one import
(`packages/common/src/typescript/public.ts:1`) and **all** parsing through one
function (`packages/common/src/compiler/createCompilerSourceFile.ts:12`, a full
reparse — there is no incremental update). That is the swap point.

What ts-morph needs that the new AST does not give directly:

| Need | Status |
|---|---|
| `getChildren()` + `SyntaxList` | **Solved** — `getChildren.mts`, exact parity |
| `getLastToken()` (`Node.ts:1251`) | Same technique; 1 call site |
| Reparse after edit | **Solved** — `edit-loop.mts` |
| Mutable `sourceFile.fileName` | **Throws** — `RemoteSourceFile.fileName` is a getter with no setter (`createDocumentCache.ts:135` assigns it). Needs a thin owning wrapper. |
| `sourceFile.version` stamping, `node.parent` assignment | Work as-is |
| `.symbol` / `.locals` / `.emitNode` | **Absent** — binder internals are not exposed. Route through the checker (`getSymbolAtLocation`) instead. |
| `.imports` / `.scriptKind` / `.modifiers` | Present |
| Recursive `deepClone` of a SourceFile (`createDocumentCache.ts:134`) | Risky — nodes are lazy `DataView` views with a circular `_sourceFile` back-reference. The server-side snapshot cache likely replaces this path rather than shimming it. |

Checker coverage is good: of the 26 `ts.TypeChecker` methods ts-morph calls, the
API already exposes most; the notable absentees are `getAmbientModules`,
`getAwaitedType`, `getFullyQualifiedName`, and `getSymbolsInScope`.

**The LanguageService gap is not missing functionality.** ts-morph uses 14
LanguageService methods, and tsgo already implements the equivalents in Go under
`internal/ls` — `ProvideRename`/`GetRenameInfo`, `OrganizeImports`,
`ProvideFormatDocument`/`ProvideFormatDocumentRange`, `ProvideCodeActions` (incl.
import fixes), `ProvideDefinition`, `ProvideImplementations`,
`GetReferencedSymbolsForNode`. They are simply not routed through the API
session's method table. Because this repo owns the fork, exposing them is
additive work in `internal/api` (mapping the LSP-shaped types to API types),
not a blocker.

## Remaining work (the actual ts-morph integration)

This lands the **backend + seam**. Re-plumbing `@ts-morph/common`'s `ts` layer
onto it is the larger follow-up:

1. Point the common compiler-node layer at `unstable/ast` nodes (shim classic-only
   members, wiring in `getChildren.mts`), keeping ts-morph's public API 1-1.
2. Route reparse-after-edit through the in-process module (as in `edit-loop.mts`)
   instead of a local `ts.createSourceFile`.
3. Back the type-info layer (`Type`/`Symbol`/`Signature`) with the seam's checker.
4. Map wrapped nodes ↔ tsgo node handles by position/index.

5. Expose the `internal/ls` capabilities through `internal/api` so rename,
   organize-imports, formatting, and code fixes have a backend (see above).
