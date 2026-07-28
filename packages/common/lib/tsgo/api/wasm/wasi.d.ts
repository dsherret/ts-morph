/**
 * A `wasi_snapshot_preview1` implementation for the tsgo reactor, written
 * against the web platform only.
 *
 * The reactor is built with `GOOS=wasip1`, so the Go toolchain emits imports
 * against the WASI ABI whether or not the program uses them. Almost none of it
 * is used: the file system is delegated to JavaScript through the `ts_host`
 * callbacks, so the only calls the reactor makes are for the clocks, for
 * randomness, for the argument vector, and for a one-time probe of stdio and of
 * the preopened directory table. Answering those here instead of through Node's
 * own WASI implementation is what lets one loader serve Node, Deno and the
 * browser — nothing below touches a host built-in.
 *
 * Everything the reactor never calls still has to be present, or instantiation
 * fails on a missing import. Those report failure and go through
 * {@link WasiShimOptions.onUnsupported}, so a test can assert that a real
 * workload never reaches one.
 */
/** The subset of a WebAssembly memory this shim uses. */
export interface WasiMemory {
    buffer: ArrayBuffer;
}
export interface WasiShimOptions {
    /**
     * The reactor's linear memory. Consulted on every call rather than captured
     * once, because growing the memory detaches the previous `ArrayBuffer`.
     */
    getMemory(): WasiMemory;
    /** Receives text written to fd 1. Defaults to `console.log`. */
    onStdout?(text: string): void;
    /**
     * Receives text written to fd 2. Defaults to `console.error`.
     *
     * The Go runtime reports a fatal error here and then traps, so leaving this
     * silent turns a crash into an unexplained one.
     */
    onStderr?(text: string): void;
    /**
     * Called with the name of an import the shim does not implement, before it
     * reports failure. A working reactor never reaches one.
     */
    onUnsupported?(name: string): void;
}
/** The `wasi_snapshot_preview1` import object. */
export type WasiImports = Record<string, (...args: any[]) => number>;
/**
 * Builds the `wasi_snapshot_preview1` import object for one reactor instance.
 *
 * The instance does not exist yet when its imports are built, which is why the
 * memory arrives as a callback.
 */
export declare function createWasiImports(options: WasiShimOptions): WasiImports;
