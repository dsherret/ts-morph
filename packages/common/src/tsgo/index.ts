/**
 * Adapter for the tsgo (TypeScript 7+) compiler, run in-process via WebAssembly.
 *
 * This layer sits between the new AST/checker and ts-morph's wrappers, filling
 * the gaps between what the new compiler exposes and what ts-morph's public API
 * requires. It is deliberately shaped around the `unstable/sync` API so the
 * backend can later be swapped for the subprocess/native build.
 *
 * Not yet re-exported from the package index: the compiler layer still runs on
 * `typescript`, and this is wired in per-piece as that migration proceeds.
 */
export { DocumentRegistry, type DocumentRegistryOptions, type RemoveSourceFileOptions } from "./documentRegistry";
export { createFileSystemAdapter, type FileSystemAdapterOptions } from "./fileSystemAdapter";
export { getChildren, getLastToken } from "./getChildren";
export { createInProcessApi, type InProcessApiOptions } from "./inProcessApi";
export { createModuleResolutionHost, type CreateModuleResolutionHostOptions, type ModuleResolutionSourceFileContainer } from "./moduleResolutionHost";
export { setSourceFileProperty } from "./mutableSourceFile";
export { getStoredNode, isReconstructedNode } from "./reconstructedNodes";
export * from "./resolutionHost";
export { type CompiledWasmModule, initializeWasm, type InitializeWasmOptions } from "./wasmModule";
