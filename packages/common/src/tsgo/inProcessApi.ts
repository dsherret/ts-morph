/**
 * Entry point to the in-process tsgo compiler.
 *
 * Runs the native TypeScript API (tsgo, TypeScript 7+) inside this process via
 * WebAssembly — no subprocess, no native addon, fully synchronous. The returned
 * `API` is the `@typescript/native-preview` `unstable/sync` API, so the backend
 * can later be swapped for the subprocess/native build without changing callers.
 */
import { createVirtualFileSystem, type FileSystem } from "../../../../submodules/typescript-go/_packages/native-preview/src/api/fs.ts";
import type { API } from "../../../../submodules/typescript-go/_packages/native-preview/src/api/sync/api.ts";
import { createWasmAPI } from "../../../../submodules/typescript-go/_packages/native-preview/src/api/wasm/node.ts";

export type { API, FileSystem };

export interface InProcessApiOptions {
  /** Initial in-memory files (path → contents), including tsconfig.json. */
  files?: Record<string, string>;
  /** A custom virtual filesystem. Takes precedence over `files`. */
  fs?: FileSystem;
  /** Current working directory used for module resolution. Defaults to "/". */
  cwd?: string;
}

/** Creates a fully synchronous {@link API} backed by the in-process tsgo build. */
export function createInProcessApi(options: InProcessApiOptions = {}): API {
  return createWasmAPI({
    cwd: options.cwd ?? "/",
    fs: options.fs ?? createVirtualFileSystem(options.files ?? {}),
  });
}
