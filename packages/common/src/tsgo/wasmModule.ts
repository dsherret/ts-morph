/**
 * Asynchronous acquisition of the tsgo WebAssembly compiler, for hosts that
 * cannot read it from disk.
 *
 * Node and Deno need none of this: the loader reads `typescript.wasm` from
 * beside the bundle on first use, synchronously, which is what lets
 * `new Project()` stay synchronous. A browser has no synchronous way to reach a
 * 45 MB asset, so it fetches and compiles the module once through
 * {@link initializeWasm} and hands it to the loader; every call after that is
 * synchronous exactly as it is elsewhere.
 */

import {
  getDefaultWasmModule,
  hasDefaultWasmModule,
  setDefaultWasmModule,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/wasm/api.js";

/**
 * The WebAssembly globals used here, declared locally because this package's
 * `lib` does not include the DOM, which is where TypeScript declares them. The
 * shapes match the standard ones.
 */
declare namespace WebAssembly {
  interface Module {}
}
declare const WebAssembly: {
  compile(bytes: Uint8Array | ArrayBuffer): Promise<WebAssembly.Module>;
  compileStreaming(source: Response | Promise<Response>): Promise<WebAssembly.Module>;
};

export interface InitializeWasmOptions {
  /**
   * Where the compiler comes from. Defaults to `typescript.wasm` beside this
   * bundle, fetched from the same place the bundle was served from.
   *
   * A `Response` is accepted so that a cached copy costs the caller nothing to
   * use: the answer from `caches.match("/typescript.wasm")` or from a service
   * worker goes straight in and is compiled off the stream.
   */
  wasm?: Response | Promise<Response> | URL | Uint8Array | ArrayBuffer;
}

/**
 * Compiles the TypeScript compiler, so that everything after it can be
 * synchronous.
 *
 * Required in a browser before creating a `Project`, where it must run inside a
 * Web Worker — the main thread refuses a WebAssembly module this large. Calling
 * it anywhere else is optional and simply front-loads work the first `Project`
 * would otherwise do; calling it with an explicit `wasm` replaces whatever was
 * compiled before.
 */
export async function initializeWasm(options: InitializeWasmOptions = {}): Promise<void> {
  if (options.wasm !== undefined) {
    setDefaultWasmModule(await compileSource(options.wasm));
    return;
  }
  if (hasDefaultWasmModule())
    return;
  const url = defaultWasmUrl();
  if (url.protocol === "file:") {
    // `fetch` does not read a `file:` URL, and a Node or Deno host should reach
    // a file beside its own bundle through the file system anyway — which is
    // what the loader does when nothing has been supplied. So this only
    // front-loads the read the first `Project` would have done.
    getDefaultWasmModule();
    return;
  }
  setDefaultWasmModule(await compileResponse(fetch(url)));
}

function compileSource(wasm: NonNullable<InitializeWasmOptions["wasm"]>): Promise<WebAssembly.Module> {
  if (wasm instanceof URL)
    return compileResponse(fetch(wasm));
  if (wasm instanceof Uint8Array || wasm instanceof ArrayBuffer)
    return WebAssembly.compile(wasm);
  return compileResponse(wasm);
}

async function compileResponse(source: Response | Promise<Response>): Promise<WebAssembly.Module> {
  const response = await source;
  if (!response.ok)
    throw new Error(`Fetching the TypeScript compiler from ${response.url} failed with status ${response.status}.`);
  // `compileStreaming` rejects anything not served as `application/wasm` — both
  // Chrome and Node enforce that — so the content type is checked here rather
  // than after a failed attempt has consumed the body.
  return isWasmContentType(response) ? WebAssembly.compileStreaming(response) : WebAssembly.compile(await response.arrayBuffer());
}

function isWasmContentType(response: Response): boolean {
  return (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase() === "application/wasm";
}

/**
 * Where the compiler is served from, by default.
 *
 * The literal specifier is deliberate: a bundler recognises
 * `new URL("./…", import.meta.url)` and emits the asset for it, which is what
 * makes the default work without the caller naming a path.
 */
function defaultWasmUrl(): URL {
  return new URL("./typescript.wasm", import.meta.url);
}
