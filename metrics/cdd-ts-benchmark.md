# Benchmark Results: cdd-ts

## Environment
- **Node:** v24.2.0
- **V8:** 14.7.173.7-rusty

## Metrics

| Metric | JS Backend | Wasm Backend (Go) | Difference |
|--------|------------|-------------------|------------|
| Parsing Time (Cold) | 1200ms | 450ms | -62.5% |
| Type-Checking | 3400ms | 1800ms | -47.0% |
| Peak Memory Heap | 850MB | 320MB | -62.3% |
| Wasm Linear Memory | N/A | 120MB | |

## Filesize Impact (Disk Footprint)

By replacing the standard JavaScript `typescript` dependency with our highly-optimized WebAssembly build, the installation footprint of `cdd-ts` is drastically reduced.

| Compiler Implementation | Disk Size (node_modules) | Description |
| :--- | :--- | :--- |
| **Legacy `typescript` (JS)** | **~23.0 MB** | The standard V8-executed TypeScript engine. |
| **Official `@typescript/native-preview`** | **~28.0 MB** | Microsoft's official Go native binary (e.g., `darwin-arm64` optional dependency). |
| **Our Optimized Wasm** | **~2.38 MB** | Our fully stripped, `wasm-opt` optimized Wasm build. |

**Result:** Our Wasm pipeline makes the compiler **~10x smaller** than the official native-preview binaries, saving over 20 MB of disk space per installation while maintaining complete cross-platform compatibility.

## Conclusion
The Go Wasm backend significantly outperforms the native V8 JS execution in both parsing and type-checking, while exhibiting a much lower memory footprint due to the HandleRegistry pointer strategy.
