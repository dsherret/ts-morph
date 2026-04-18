# Prerequisites

This project requires:
- [Deno](https://docs.deno.com/runtime/manual/getting_started/installation)
- [Go](https://go.dev/doc/install) (>= 1.22) required for the Wasm compiler backend.

# Getting Started

Install [deno](https://deno.com).

Run in root of repo:

```bash
# installs, sets up, and builds all the packages for development
deno task setup
```

# Packages

- [packages/ts-morph](packages/ts-morph)
- [packages/bootstrap](packages/bootstrap)
- [packages/common](packages/common) - Common code used by both of the packages above.
- [packages/scripts](packages/scripts) - Common scripts used at development time by both packages.

# Commands

```bash
# build (run in root dir or per package)
deno task build
# run tests (run in root dir or per package)
deno task --recursive test
# format
deno task format
```

# Wasm Backend (typescript-go)

This project has migrated to a Go WebAssembly backend.

### Compilation Pipeline
The Wasm compilation is handled via `scripts/build-wasm.ts`. It compiles the Go code in `packages/compiler-go-bridge` using `GOOS=js GOARCH=wasm go build`. It then runs Binaryen's `wasm-opt` to heavily optimize and compress the output before distribution.

To test local changes to the Go bridge:
```bash
deno run -A scripts/build-wasm.ts
```

### Architecture Diagram
- **HandleRegistry (Go):** Keeps references to Go structs so they aren't garbage collected.
- **WasmBridge (JS):** Uses a `FinalizationRegistry` to detect when JS wrappers (like `Node`) are GC'd by V8, sending a `free` message over the Wasm bridge to release the Go memory.

### Debugging Wasm
If you encounter panics, the Wasm bridge translates Go panics into standard JS Errors with stack traces. You can also view raw Go stdout/stderr directly in the Node/browser console.
