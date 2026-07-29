/**
 * Entry point to the in-process tsgo compiler.
 *
 * Runs the native TypeScript API (tsgo, TypeScript 7+) inside this process via
 * WebAssembly — no subprocess, no native addon, fully synchronous. The returned
 * `API` is the `@typescript/native-preview` `unstable/sync` API, so the backend
 * can later be swapped for the subprocess/native build without changing callers.
 */
import { createVirtualFileSystem, type FileSystem } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import type { API } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";
import { createWasmAPI } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/wasm/api.js";
import type { CompiledWasmModule } from "./wasmModule";

export type { API, FileSystem };

export interface InProcessApiOptions {
  /** Initial in-memory files (path → contents), including tsconfig.json. */
  files?: Record<string, string>;
  /** A custom virtual filesystem. Takes precedence over `files`. */
  fs?: FileSystem;
  /** Current working directory used for module resolution. Defaults to "/". */
  cwd?: string;
  /**
   * Directory the default lib files are read from, through the file system.
   * Defaults to the lib files bundled inside the wasm module.
   */
  defaultLibraryPath?: string;
  /** Whether the file system distinguishes case. Defaults to true. */
  useCaseSensitiveFileNames?: boolean;
  /**
   * The reactor module: already compiled, or the bytes to compile it from.
   * Defaults to the module shipped beside this bundle, or to whatever
   * `initializeWasm` compiled.
   *
   * A file path is deliberately not accepted, though it once was. One loader now
   * serves Node, Deno and the browser, and only two of those have a file system;
   * a path would be an option that exists everywhere and works in some places.
   * Read the file and pass the bytes, or hand over a compiled module.
   */
  wasm?: Uint8Array | ArrayBuffer | CompiledWasmModule;
}

/** Creates a fully synchronous {@link API} backed by the in-process tsgo build. */
export function createInProcessApi(options: InProcessApiOptions = {}): API {
  return createWasmAPI({
    cwd: options.cwd ?? "/",
    fs: options.fs ?? createVirtualFileSystem(options.files ?? {}),
    wasm: options.wasm,
    defaultLibraryPath: options.defaultLibraryPath,
    useCaseSensitiveFileNames: options.useCaseSensitiveFileNames,
  });
}
