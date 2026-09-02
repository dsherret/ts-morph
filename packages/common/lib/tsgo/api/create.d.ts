/**
 * A single entry point that runs the engine natively when the host can, and in
 * the in-process WebAssembly reactor when it cannot.
 *
 * "When it can" means two things at once: the host is one that can spawn a child
 * process (Node, Deno, Bun — not a browser), and a native binary for its exact
 * platform is actually present. The native backend is a spawned `tsc --api`
 * subprocess spoken to synchronously; it runs the compiler as Go and is markedly
 * faster than Wasm. Everything else — a browser, or a platform no native build
 * was published for — falls back to the reactor, which runs the same requests
 * in-process with no subprocess at all.
 *
 * The backend is chosen once, at creation. The {@link API} it returns is the
 * same class either way, so nothing above this line depends on which one ran.
 */
import type { FileSystem } from "./fs";
import type { ModuleNameResolver } from "./options";
import { API } from "./sync/api";
import { type WasmSource } from "./wasm/api";
/** Which engine backs the API. */
export type Backend = "native" | "wasm";
export interface CreateAPIOptions {
    /**
     * Force a backend instead of choosing one. Left unset, the native backend is
     * used when it is available (see {@link isNativeBackendAvailable}) and the
     * reactor otherwise.
     */
    backend?: Backend;
    /** Current working directory used for module resolution. Defaults to "/". */
    cwd?: string;
    /** Virtual filesystem callbacks. */
    fs?: FileSystem;
    /** Resolves a module specifier in place of the compiler. */
    resolveModuleName?: ModuleNameResolver;
    /** When true, collect per-request timing information. */
    collectTiming?: boolean;
    /** Native backend: path to the `tsc` binary. Overrides platform discovery. */
    tsserverPath?: string;
    /** Native backend: allow trusted projects to run external content mappers. */
    runExternalCode?: boolean;
    /**
     * Wasm backend: the reactor module, or the bytes to compile it from. Node,
     * Deno and Bun read `typescript.wasm` from disk when this is omitted; a
     * browser has no disk to read from, so it must supply the module here (or
     * once, up front, via {@link setDefaultWasmModule}).
     */
    wasm?: WasmSource;
    /** Wasm backend: directory the default lib files are read from through {@link fs}. */
    defaultLibraryPath?: string;
    /** Wasm backend: whether the file system distinguishes case. Defaults to true. */
    useCaseSensitiveFileNames?: boolean;
    /**
     * Wasm backend: bytes of linear memory reserved for the Go heap before the
     * runtime starts. Defaults to 128 MiB — see `defaultInitialHeapSize`.
     */
    initialHeapSize?: number;
}
/** The created {@link API} together with the backend that ended up behind it. */
export interface CreatedAPI {
    api: API;
    backend: Backend;
}
/**
 * Creates an {@link API}, preferring the native backend and falling back to the
 * WebAssembly reactor. See {@link createAPIWithBackend} to also learn which one
 * was chosen.
 */
export declare function createAPI(options?: CreateAPIOptions): API;
/**
 * Like {@link createAPI}, but also reports the backend it selected — useful for
 * logging, telemetry, or a test that means to exercise a specific one.
 */
export declare function createAPIWithBackend(options?: CreateAPIOptions): CreatedAPI;
/**
 * The backend {@link createAPI} would choose for these options: an explicit
 * {@link CreateAPIOptions.backend} when given, otherwise "native" if it is
 * available and "wasm" if not.
 */
export declare function selectBackend(options?: CreateAPIOptions): Backend;
/**
 * Whether the native backend can run here: a host that can spawn a child
 * process, and a native binary present for its platform. A browser fails the
 * first test; a platform with no published build fails the second.
 *
 * An explicit `tsserverPath` is taken on trust — it is the caller asserting a
 * binary is there, so it is not checked to exist (checking would mean reading
 * the filesystem, which this module stays clear of so it can be bundled for the
 * browser). A wrong path therefore reports available and fails when spawned.
 */
export declare function isNativeBackendAvailable(options?: {
    tsserverPath?: string;
}): boolean;
