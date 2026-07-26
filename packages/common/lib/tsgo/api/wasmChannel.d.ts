/**
 * In-process WebAssembly transport for the API client.
 *
 * The tsgo-wasm reactor module (see cmd/tsgo-wasm) runs the API server in the
 * same process as the client. This channel drives it synchronously and exposes
 * the same surface as the subprocess-backed {@link SyncRpcChannel}, so the two
 * are interchangeable behind {@link Client}. Filesystem access is delegated back
 * to JS through the host imports returned by {@link WasmChannel.hostImports},
 * reusing the same callback contract as the STDIO server.
 */
/**
 * A synchronous request channel to the API server. Implemented by both the
 * subprocess-backed SyncRpcChannel and the in-process {@link WasmChannel}.
 */
export interface RpcChannel {
    lastBytesSent: number;
    lastBytesReceived: number;
    requestSync(method: string, payload: string): string;
    requestBinarySync(method: string, payload: Uint8Array): Uint8Array;
    registerCallback(name: string, callback: (name: string, payload: string) => string): void;
    close(): void;
}
/**
 * The subset of a WebAssembly memory this channel uses. Declared structurally
 * so the package does not need the DOM library for its types.
 */
/** What the reactor needs to build its session. */
export interface SessionOptions {
    /** Current working directory used for module resolution. */
    cwd: string;
    /**
     * Directory the default lib files are read from. Defaults to the libs bundled
     * in the module; a host that supplies its own lib files points this at them.
     */
    defaultLibraryPath?: string;
    /**
     * Whether the host's file system distinguishes case. Defaults to true; a host
     * backed by a Windows or macOS disk says false so paths resolve the way that
     * disk resolves them.
     */
    useCaseSensitiveFileNames?: boolean;
}
export interface WasmMemory {
    buffer: ArrayBuffer;
}
/** The exports of the tsgo-wasm reactor module. */
export interface WasmExports {
    memory: WasmMemory;
    create_session(cwdPtr: number, cwdLen: number): number;
    close_session(): void;
    get_request_buffer(size: number): number;
    handle_request(methodLen: number, payloadLen: number): number;
    response_ptr(): number;
    response_len(): number;
    response_is_binary(): number;
}
/** The `ts_host` import module the reactor expects. */
export interface WasmHostImports {
    callback(namePtr: number, nameLen: number, argPtr: number, argLen: number): number;
    read_result(destPtr: number, destLen: number): void;
}
export declare class WasmChannel implements RpcChannel {
    lastBytesSent: number;
    lastBytesReceived: number;
    /**
     * Whether the most recent response was raw binary rather than JSON, as
     * reported by the module's `response_is_binary` export.
     */
    lastResponseIsBinary: boolean;
    private exports;
    private readonly callbacks;
    private readonly encoder;
    private readonly decoder;
    private callbackResult;
    private inRequest;
    /**
     * The `ts_host` imports bound to this channel. Pass these to the module's
     * import object. They are only invoked while a request is in flight (i.e.
     * after {@link bind}), so it is safe to read them before binding.
     *
     * Neither import may throw. A JS exception thrown out of a wasm import
     * unwinds the Go frames as a trap rather than a Go panic, so no deferred
     * unlock runs, any goroutine waiting on the trapped one deadlocks, and the
     * module is permanently dead. Failure is reported through the return value
     * instead, which the Go side turns into an ordinary error.
     */
    readonly hostImports: WasmHostImports;
    /**
     * Binds an instantiated reactor and creates the API session. Must be called
     * exactly once, before any request.
     */
    bind(exports: WasmExports, options: SessionOptions): void;
    registerCallback(name: string, callback: (name: string, payload: string) => string): void;
    requestSync(method: string, payload: string): string;
    requestBinarySync(method: string, payload: Uint8Array): Uint8Array;
    close(): void;
    private request;
    /**
     * A view over `len` bytes of linear memory at `ptr`. Always reads
     * `memory.buffer` afresh because it is detached whenever the module grows
     * its memory.
     */
    private view;
    private readString;
}
