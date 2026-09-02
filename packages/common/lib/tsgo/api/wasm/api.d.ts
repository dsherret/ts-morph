/**
 * Entry point for the in-process WebAssembly API.
 *
 * Instantiates the tsgo-wasm reactor and returns a fully synchronous {@link API}
 * backed by it — no subprocess, no native addon. Instantiation is synchronous, so
 * construction blocks until the session is ready and every subsequent request is
 * a plain function call.
 *
 * Nothing here reaches for a host built-in: WASI is answered by the shim in
 * ./wasi.ts, and the module either arrives from the caller — already compiled or
 * as bytes — or is read from beside this file through whatever the host offers
 * without an import. A browser has none of those, which is why a host that
 * targets one compiles the module itself and calls {@link setDefaultWasmModule}.
 */
import type { FileSystem } from "../fs";
import type { ModuleNameResolver } from "../options";
import { API } from "../sync/api";
import { type WasiShimOptions } from "./wasi";
/**
 * The WebAssembly types this module uses, declared locally so the package does
 * not need the DOM library. The shapes match the standard ones.
 */
declare namespace WebAssembly {
    interface Module {
    }
    interface Instance {
        readonly exports: unknown;
    }
}
declare const WebAssembly: {
    Module: new (bytes: Uint8Array | ArrayBuffer) => WebAssembly.Module;
    Instance: new (module: WebAssembly.Module, imports: Record<string, unknown>) => WebAssembly.Instance;
};
/** The reactor module: already compiled, or the bytes to compile it from. */
export type WasmSource = WebAssembly.Module | Uint8Array | ArrayBuffer;
export interface WasmApiOptions {
    /**
     * The reactor module. Defaults to `typescript.wasm` beside this module, or
     * to whatever {@link setDefaultWasmModule} was last given.
     */
    wasm?: WasmSource;
    /** Current working directory used for module resolution. Defaults to "/". */
    cwd?: string;
    /**
     * Directory the default lib files are read from, through {@link fs}. Defaults
     * to the lib files bundled in the module.
     */
    defaultLibraryPath?: string;
    /** Whether the file system distinguishes case. Defaults to true. */
    useCaseSensitiveFileNames?: boolean;
    /** Virtual filesystem callbacks. */
    fs?: FileSystem;
    /**
     * Bytes of linear memory to reserve for the Go heap before the runtime starts.
     * Defaults to 128 MiB; 0 reserves nothing. See {@link defaultInitialHeapSize}.
     */
    initialHeapSize?: number;
    /**
     * Resolves a module specifier in place of the compiler. See the option of
     * the same name in ../options.ts for what an answer means.
     */
    resolveModuleName?: ModuleNameResolver;
    /** When true, collect per-request timing information. */
    collectTiming?: boolean;
    /**
     * Diagnostic hooks for the WASI shim. Only a Go runtime failure produces
     * output, and a working reactor never reaches an unsupported import, so this
     * is for observing that rather than for changing behaviour.
     */
    wasi?: Pick<WasiShimOptions, "onStdout" | "onStderr" | "onUnsupported">;
}
/**
 * Creates a synchronous {@link API} backed by the in-process WebAssembly reactor.
 */
export declare function createWasmAPI(options?: WasmApiOptions): API;
/**
 * How much linear memory {@link createWasmAPI} reserves for the Go heap by default.
 *
 * Go's wasm runtime records the size of linear memory when it starts and hands
 * that whole range to its allocator; only once the heap outgrows it does it call
 * `memory.grow`, and it grows by exactly what the allocator asked for. Every one
 * of those grows is dear in V8: the memory's `ArrayBuffer` is detached and
 * replaced, and the growth counts against the external-memory budget that
 * triggers JavaScript garbage collections. Encoding a syntax tree allocates
 * heavily and briefly, which is the shape that suffers most — profiling a
 * 300-file check put `memory.grow` and the collector it provoked at 13% of all
 * samples, and fetching 200 files' trees cost six times what it costs with the
 * heap reserved up front. Growing once, here, before the runtime measures the
 * memory, makes every later allocation an ordinary one.
 *
 * Reserved pages are committed lazily by the host, so the reservation costs no
 * resident memory until the heap actually reaches it; 128 MiB covers a few
 * hundred files with room to spare, and a heap that needs more grows as before.
 */
export declare const defaultInitialHeapSize: number;
/**
 * Supplies the module every later {@link createWasmAPI} call instantiates.
 *
 * Compiling the reactor costs tens of milliseconds and tens of megabytes, and
 * instantiating it costs a few milliseconds, so it is compiled once. This is
 * also the only way to use the reactor where it cannot be read from disk: a
 * browser fetches and compiles it, then hands the result over here.
 */
export declare function setDefaultWasmModule(wasm: WasmSource): void;
/** Whether a default module is already available without reading anything. */
export declare function hasDefaultWasmModule(): boolean;
/**
 * The module every {@link createWasmAPI} call without a `wasm` option
 * instantiates, reading and compiling it from disk on first use.
 */
export declare function getDefaultWasmModule(): WebAssembly.Module;
export {};
