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

## Build & run

```sh
# build the wasm (needs the Go toolchain; see submodule go.mod)
node submodules/typescript-go/_scripts/build-wasm.mjs

# prove it end-to-end
node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/proof.mts
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

## Remaining work (the actual ts-morph integration)

This lands the **backend + seam**. Re-plumbing `@ts-morph/common`'s `ts` layer
onto it is the larger follow-up:

1. Point the common compiler-node layer at `unstable/ast` nodes (shim classic-only
   members), keeping ts-morph's public API 1-1.
2. Route reparse-after-edit through the in-process module (push changed text via
   the FS callback + re-request the source file) instead of a local
   `ts.createSourceFile`.
3. Back the type-info layer (`Type`/`Symbol`/`Signature`) with the seam's checker.
4. Map wrapped nodes ↔ tsgo node handles by position/index.

Gap to track upstream: the unstable API has **no LanguageService edit surface**
yet (rename/organize-imports/format/code-fixes). Those ts-morph features stay on
`typescript@6` until tsgo exposes them.
