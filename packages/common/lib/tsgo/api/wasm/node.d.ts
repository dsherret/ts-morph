/**
 * Node.js entry point for the in-process WebAssembly API.
 *
 * Instantiates the tsgo-wasm reactor with Node's WASI implementation and returns
 * a fully synchronous {@link API} backed by it — no subprocess, no native addon.
 * The module is compiled and instantiated synchronously, so construction blocks
 * until the session is ready; every subsequent request is a plain function call.
 */
import type { FileSystem } from "../fs";
import { API } from "../sync/api";
export interface NodeWasmApiOptions {
    /**
     * The reactor module: a path to the `.wasm` file, or its bytes. Defaults to
     * the module bundled in this package's `dist/`.
     */
    wasm?: string | Uint8Array | ArrayBuffer;
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
    /** When true, collect per-request timing information. */
    collectTiming?: boolean;
}
/**
 * Creates a synchronous {@link API} backed by the in-process WebAssembly reactor.
 */
export declare function createWasmAPI(options?: NodeWasmApiOptions): API;
