# RFC-0002: Go Wasm Compiler Migration

**Title:** Replace JavaScript TypeScript Compiler with `typescript-go` (Wasm)
**Author:** Samuel
**Status:** Accepted

## Summary
Migrate the underlying compiler engine of `ts-morph` from the official V8-executed JavaScript `typescript` npm package to Microsoft's new `typescript-go` port, compiled to WebAssembly.

## Motivation
1. **Performance:** `ts-morph` operates on massive ASTs. The Go port demonstrates significant speedups in parsing and type-checking.
2. **Memory Overhead:** V8 objects for AST nodes consume excessive RAM. Utilizing a Wasm Handle/Pointer strategy allows the heavy structs to remain in Wasm linear memory, exposing only lightweight JS proxies to the user.
3. **Future Proofing:** Microsoft is actively investing in the Go port for performance-critical tooling. Aligning early secures long-term sustainability.

## Alternatives Considered
- **SWC / Rome / Biome:** Rejected because they do not have 100% type-checking parity or compatible API surfaces with the TS compiler.
- **Native Rust Bindings (N-API):** Rejected due to the operational overhead of distributing native binaries across platforms compared to a single universally runnable `.wasm` file.

## Implementation Details
Refer to `PLAN.md` for the multi-phase implementation pipeline, notably the `HandleRegistry` and `FinalizationRegistry` mechanisms used to bridge the GC gap between Go and V8.