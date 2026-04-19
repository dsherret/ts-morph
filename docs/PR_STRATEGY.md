# Pull Request Strategy

As outlined in the Comprehensive Migration Plan (`PLAN.md`), replacing the JavaScript TypeScript compiler with `typescript-go` (Wasm) involves working across two repositories. Here is the formal strategy for upstream integration.

## PR #1: Microsoft/typescript-go

**Target:** `microsoft/typescript-go` (Upstream)
**Goal:** Expose necessary internal AST and TypeChecker hooks to `syscall/js`.

The `typescript-go` project currently marks its API as internal/unstable. To build our bridge without maintaining a permanent, divergent hard-fork, we will propose a PR to upstream `typescript-go` that introduces a non-intrusive `syscall/js` export layer.

**Changes:**
- Add a new build tag/file `js_exports.go` in the relevant packages that only compiles when `GOOS=js`.
- Register lightweight pointer IDs (handles) into a `HandleRegistry` to avoid serializing massive JSON strings.
- Expose basic `parse`, `getTypeAtLocation`, and `updateTextSpan` functions.

## PR #2: dsherret/ts-morph

**Target:** `dsherret/ts-morph` (Main Repository)
**Goal:** Implement the Wasm Bridge and swap out the `typescript` npm dependency.

Once PR #1 is merged (or while it's in review, using our submodule fork), we will submit the massive integration PR to `ts-morph`.

**Changes:**
- Introduce `packages/compiler-go-bridge` and `packages/compiler-go-source` (submodule).
- Add the `scripts/build-wasm.ts` optimization pipeline (`wasm-opt`, `go build`).
- Implement the `FinalizationRegistry` and `WeakMap` object identity cache in `ts-morph`.
- Convert `ts-morph` internal logic to use the proxy wrappers instead of native `ts.Node` objects.
- Update CI to run the existing Mocha test suite against both the JS and Wasm backends during the transitional period.