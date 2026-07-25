/**
 * ts-morph ⇄ tsgo seam.
 *
 * Exposes the in-process WebAssembly build of the native TypeScript API (tsgo,
 * TypeScript 7+) as a single factory. It is deliberately shaped around the
 * `@typescript/native-preview` `unstable/sync` `API`, so the underlying backend
 * can later be swapped for the subprocess/native build (for native performance)
 * without changing callers.
 *
 * This is the integration point that @ts-morph/common's compiler layer will
 * target: ts-morph's wrappers navigate/manipulate on the `unstable/ast` nodes
 * this API returns, and query types/symbols/diagnostics through its checker.
 */
import { createVirtualFileSystem, type FileSystem } from "../submodules/typescript-go/_packages/native-preview/src/api/fs.ts";
import type { API } from "../submodules/typescript-go/_packages/native-preview/src/api/sync/api.ts";
import { createWasmAPI } from "../submodules/typescript-go/_packages/native-preview/src/api/wasm/node.ts";

export type { API, FileSystem };

export interface InProcessApiOptions {
    /** Initial in-memory files (path → contents), including tsconfig.json. */
    files?: Record<string, string>;
    /** A custom virtual filesystem. Takes precedence over `files`. */
    fs?: FileSystem;
    /** Current working directory used for module resolution. Defaults to "/". */
    cwd?: string;
}

/**
 * Creates a fully synchronous {@link API} backed by the in-process tsgo-wasm
 * reactor — no subprocess, no native addon.
 */
export function createInProcessApi(options: InProcessApiOptions = {}): API {
    return createWasmAPI({
        cwd: options.cwd ?? "/",
        fs: options.fs ?? createVirtualFileSystem(options.files ?? {}),
    });
}
