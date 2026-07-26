/**
 * Shared utilities for the TypeScript API client.
 */
import type { FileSystem } from "./fs";
import type { RpcChannel } from "./wasmChannel";
export interface ClientSocketOptions {
    /** Path to the Unix domain socket or Windows named pipe for API communication */
    pipe: string;
}
export interface ClientWasmOptions {
    /**
     * A pre-built request channel, e.g. a {@link WasmChannel} bound to an
     * in-process WebAssembly reactor. When provided, no subprocess is spawned
     * and the API server runs in the same process as the client.
     */
    channel: RpcChannel;
    /** Virtual filesystem callbacks */
    fs?: FileSystem;
    /** When true, collect per-request timing information. */
    collectTiming?: boolean;
}
export interface ClientSpawnOptions {
    /** Path to the tsgo executable. Defaults to the bundled tsgo binary. */
    tsserverPath?: string;
    /** Current working directory */
    cwd?: string;
    /** Virtual filesystem callbacks */
    fs?: FileSystem;
    /**
     * When true, collect timing information for each request. The client
     * measures round-trip latency and bytes sent/received, and the server
     * measures its own per-request processing time; both are combined (along
     * with an estimated transport overhead) in the snapshot returned by
     * {@link API.getTimingInfo}.
     */
    collectTiming?: boolean;
}
export type ClientOptions = ClientSocketOptions | ClientSpawnOptions | ClientWasmOptions;
export declare function isSpawnOptions(options: ClientOptions): options is ClientSpawnOptions;
export declare function isWasmOptions(options: ClientOptions): options is ClientWasmOptions;
export declare function resolveExePath(options: ClientSpawnOptions): string;
export interface LSPConnectionOptions extends ClientSocketOptions {
}
export interface APIOptions extends ClientSpawnOptions {
}
