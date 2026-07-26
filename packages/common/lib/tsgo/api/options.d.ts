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
    /**
     * Resolves a module specifier, in place of the compiler’s own resolution.
     *
     * The compiler asks before resolving anything itself and takes the answer as
     * final. Returning `undefined` declines to have an opinion and leaves the
     * specifier to the compiler; returning `{ resolved: null }` says it resolves
     * to nothing, which the compiler will not try to improve on.
     *
     * Enabling this costs a call per specifier per containing directory, so a
     * host that does not need it should leave it unset.
     */
    resolveModuleName?: ModuleNameResolver;
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
     * Resolves a module specifier, in place of the compiler’s own resolution.
     *
     * The compiler asks before resolving anything itself and takes the answer as
     * final. Returning `undefined` declines to have an opinion and leaves the
     * specifier to the compiler; returning `{ resolved: null }` says it resolves
     * to nothing, which the compiler will not try to improve on.
     *
     * Enabling this costs a call per specifier per containing directory, so a
     * host that does not need it should leave it unset.
     */
    resolveModuleName?: ModuleNameResolver;
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
/** A request to resolve one module specifier. */
export interface ModuleNameResolutionRequest {
    moduleName: string;
    containingFile: string;
    /**
     * How the containing file imports: 0 when the compiler has no opinion,
     * otherwise a `ModuleKind` of CommonJS or ESNext.
     */
    resolutionMode: number;
}
/** Where a module specifier resolves to. */
export interface ResolvedModuleName {
    resolvedFileName: string;
    /** Derived from the file name when omitted. */
    extension?: string;
    isExternalLibraryImport?: boolean;
    resolvedUsingTsExtension?: boolean;
}
/**
 * Answers where a specifier resolves. `undefined` declines the question and
 * leaves it to the compiler; `{ resolved: null }` resolves it to nothing.
 */
export type ModuleNameResolver = (request: ModuleNameResolutionRequest) => ModuleNameResolution | undefined;
/**
 * What a host answers about a specifier.
 *
 * `{ resolved }` places it, and `null` places it nowhere. `{ moduleName }` asks
 * the compiler to resolve a different specifier instead, which is what a host
 * that only rewrites wants — turning `./mod.ts` into `./mod` says where to look,
 * not how to look, and the alternative would be reimplementing node resolution.
 */
export type ModuleNameResolution = {
    resolved: ResolvedModuleName | null;
    moduleName?: undefined;
} | {
    moduleName: string;
    resolved?: undefined;
};
