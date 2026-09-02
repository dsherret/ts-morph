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
    /** A pre-built request channel bound to an in-process WebAssembly reactor. */
    channel: RpcChannel;
    /** Virtual filesystem callbacks */
    fs?: FileSystem;
    /** Resolves a module specifier in place of the compiler. */
    resolveModuleName?: ModuleNameResolver;
    /** When true, collect per-request timing information. */
    collectTiming?: boolean;
}
export interface ClientSpawnOptions {
    /** Path to the tsc executable. Defaults to the bundled tsc binary. */
    tsserverPath?: string;
    /** Current working directory */
    cwd?: string;
    /** Virtual filesystem callbacks */
    fs?: FileSystem;
    /** Resolves a module specifier in place of the compiler. */
    resolveModuleName?: ModuleNameResolver;
    /** Allow trusted projects to execute configured external content mapper processes. */
    runExternalCode?: boolean;
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
export declare function getAPIProcessArgs(options: ClientSpawnOptions, async: boolean): string[];
export interface LSPConnectionOptions extends ClientSocketOptions {
}
export interface APIOptions extends ClientSpawnOptions {
}
/** A request to resolve one module specifier. */
export interface ModuleNameResolutionRequest {
    moduleName: string;
    containingFile: string;
    resolutionMode: number;
}
/** Where a module specifier resolves to. */
export interface ResolvedModuleName {
    resolvedFileName: string;
    extension?: string;
    isExternalLibraryImport?: boolean;
    resolvedUsingTsExtension?: boolean;
}
export type ModuleNameResolver = (request: ModuleNameResolutionRequest) => ModuleNameResolution | undefined;
export type ModuleNameResolution = {
    resolved: ResolvedModuleName | null;
    moduleName?: undefined;
} | {
    moduleName: string;
    resolved?: undefined;
};
