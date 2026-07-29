/**
 * Asynchronous acquisition of the tsgo WebAssembly compiler, for hosts that
 * cannot read it from disk.
 *
 * Node and Deno need none of this: the loader reads `typescript.wasm.gz` from
 * beside the bundle on first use, synchronously, which is what lets
 * `new Project()` stay synchronous. A browser has no synchronous way to reach a
 * 9.5 MB asset, so it fetches, gunzips and compiles the module once through
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
  Module: new(bytes: Uint8Array | ArrayBuffer) => WebAssembly.Module;
  compile(bytes: Uint8Array | ArrayBuffer): Promise<WebAssembly.Module>;
  compileStreaming(source: Response | Promise<Response>): Promise<WebAssembly.Module>;
};

/**
 * Declared locally for the same reason, and narrowed to what is used here: a
 * gzip decoder every browser has and every host this runs on with it.
 */
declare const DecompressionStream: new(format: "gzip") => {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
};

export interface InitializeWasmOptions {
  /**
   * Where the compiler comes from. Defaults to `typescript.wasm.gz` beside this
   * bundle, fetched from the same place the bundle was served from.
   *
   * A `Response` is accepted so that a cached copy costs the caller nothing to
   * use: the answer from `caches.match("/typescript.wasm.gz")` or from a service
   * worker goes straight in and is compiled off the stream. A compiled module is
   * accepted for the other way round: a module survives `postMessage`, so one
   * thread can compile the reactor once and hand it to every worker that needs
   * it.
   *
   * Bytes and responses may be gzipped or not — which they are is read off the
   * bytes, so the shipped asset and an unwrapped copy of it are equally good.
   */
  wasm?: Response | Promise<Response> | URL | Uint8Array | ArrayBuffer | CompiledWasmModule;
}

/**
 * A compiled `WebAssembly.Module`, ready to instantiate.
 *
 * Named here rather than written as `WebAssembly.Module` because that name is
 * declared by the DOM and web worker libraries and by nothing else: spelling it
 * would make these declarations, which every consumer type checks against,
 * require a `lib` that a Node project does not have. The shape is the standard
 * one, which carries no members of its own.
 */
export interface CompiledWasmModule {}

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

/**
 * The compiled module behind whatever the caller supplied.
 *
 * Takes `unknown` rather than the option's type because that type cannot say
 * much: a compiled module has no members — the standard one is an empty
 * interface — so any object satisfies the option, and a file path satisfies it
 * too. What is actually supported is decided here, and anything else is said
 * out loud rather than left to fail further down.
 */
async function compileSource(wasm: unknown): Promise<WebAssembly.Module> {
  // a promise of any of the rest, since `{ wasm: fetch(url) }` is the documented
  // shape and a missing `await` on one of the others should not be a stranger
  // kind of failure
  if (isThenable(wasm))
    return compileSource(await wasm);
  if (wasm instanceof URL)
    return compileResponse(fetch(wasm));
  if (wasm instanceof Uint8Array || wasm instanceof ArrayBuffer)
    return compileBytes(wasm);
  // already compiled: the caller did the work, or another thread did and posted
  // the result over
  if (isCompiledModule(wasm))
    return wasm;
  if (isResponse(wasm))
    return compileResponse(wasm);
  throw new Error(
    `The \`wasm\` option was given a value of type ${typeof wasm}, which is not a source the compiler can be loaded from. `
      + "Pass a Response or a promise of one, a URL, the module's bytes, or an already compiled WebAssembly.Module. "
      + "A file path is not one of them: read the file and pass the bytes.",
  );
}

/** Whether this is a promise of one of the other things the option takes. */
function isThenable(wasm: unknown): wasm is Promise<unknown> {
  return typeof (wasm as { then?: unknown } | null | undefined)?.then === "function";
}

/**
 * Whether the caller handed over a module rather than something to make one
 * from. Written as a guard because `CompiledWasmModule` has no members to
 * narrow on, being the shape of a `WebAssembly.Module`.
 */
function isCompiledModule(wasm: unknown): wasm is WebAssembly.Module {
  return wasm instanceof WebAssembly.Module;
}

/**
 * Whether this is a `Response`.
 *
 * Duck-typed rather than `instanceof Response`, because the point of taking a
 * `Response` is that it comes from wherever the caller already had one — a
 * service worker, a `Cache`, a polyfilled fetch — and those do not have to share
 * a constructor with this realm's.
 */
function isResponse(wasm: unknown): wasm is Response {
  return typeof (wasm as { arrayBuffer?: unknown } | null | undefined)?.arrayBuffer === "function";
}

/**
 * Compiles the compiler off a response, gunzipping it on the way past.
 *
 * The asset ships gzipped, so the body goes through a `DecompressionStream` and
 * is re-wrapped as `application/wasm` — which lets `compileStreaming` compile
 * the reactor while it is still arriving, instead of after 43 MB has been
 * buffered. A response that is already the raw module is passed straight
 * through, since a caller's `Response` may be a decompressed copy, or one a host
 * unwrapped itself on the way in.
 */
async function compileResponse(source: Response | Promise<Response>): Promise<WebAssembly.Module> {
  const response = await source;
  if (!response.ok)
    throw new Error(`Fetching the TypeScript compiler from ${response.url} failed with status ${response.status}.`);
  const body = response.body;
  // A hand-built or polyfilled `Response` need not have a body stream; there is
  // then nothing to stream, so the bytes are read whole and decided on after.
  if (body == null)
    return compileBytes(await response.arrayBuffer(), response.url);
  try {
    return await WebAssembly.compileStreaming(wasmResponse(body));
  } catch (error) {
    throw compilationFailed(error, response.url);
  }
}

/** Compiles bytes that are either the module or the gzipped asset it ships as. */
async function compileBytes(bytes: Uint8Array | ArrayBuffer, url = ""): Promise<WebAssembly.Module> {
  try {
    return await WebAssembly.compile(await gunzipIfCompressed(bytes));
  } catch (error) {
    throw compilationFailed(error, url);
  }
}

/**
 * The bytes of a response body as something `compileStreaming` will take:
 * gunzipped if they are gzipped, and typed `application/wasm` either way —
 * `compileStreaming` rejects anything else, in Chrome and in Node alike.
 *
 * The first two bytes decide, rather than the content type or the file name,
 * because neither is dependable: a static host may label the asset by
 * extension, or serve it with a `content-encoding` the fetch already undid.
 */
async function wasmResponse(body: ReadableStream<Uint8Array>): Promise<Response> {
  const [magic, whole] = await peek(body, 2);
  return new Response(isGzip(magic) ? gunzip(whole) : whole, { headers: { "content-type": "application/wasm" } });
}

/**
 * The first `count` bytes of a stream, and a stream that still starts with them.
 *
 * A stream cannot be read from twice and there is no peeking at one, so the
 * front is pulled off and a replacement built that hands it back before going on
 * with the rest. The read loop is a loop because a chunk boundary can fall
 * anywhere, including inside the two bytes being looked at.
 */
async function peek(stream: ReadableStream<Uint8Array>, count: number): Promise<[Uint8Array, ReadableStream<Uint8Array>]> {
  const reader = stream.getReader();
  const head: Uint8Array[] = [];
  let length = 0;
  while (length < count) {
    const { value, done } = await reader.read();
    if (done)
      break;
    head.push(value);
    length += value.length;
  }
  const restored = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of head)
        controller.enqueue(chunk);
    },
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done)
        controller.close();
      else
        controller.enqueue(value);
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
  return [concat(head, count), restored];
}

/** The bytes of the compiler, gunzipped if that is what was handed over. */
async function gunzipIfCompressed(bytes: Uint8Array | ArrayBuffer): Promise<Uint8Array | ArrayBuffer> {
  if (!isGzip(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)))
    return bytes;
  return new Response(gunzip(new Response(bytes).body!)).arrayBuffer();
}

/**
 * The stream, decompressed.
 *
 * Every host that can run this has `DecompressionStream` — it is what the
 * compressed asset is shipped against — but a host old enough to be missing it
 * would otherwise fail on the name alone, which says nothing about what to do.
 */
function gunzip(stream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  if (typeof DecompressionStream !== "function") {
    throw new Error(
      "The TypeScript compiler is served gzipped and this host has no DecompressionStream to unwrap it with. "
        + "Decompress it yourself and pass the bytes to `initializeWasm`.",
    );
  }
  return stream.pipeThrough(new DecompressionStream("gzip"));
}

function isGzip(bytes: Uint8Array): boolean {
  return bytes[0] === 0x1f && bytes[1] === 0x8b;
}

function concat(chunks: Uint8Array[], count: number): Uint8Array {
  const result = new Uint8Array(count);
  let offset = 0;
  for (const chunk of chunks) {
    const taken = chunk.subarray(0, count - offset);
    result.set(taken, offset);
    offset += taken.length;
  }
  return result.subarray(0, offset);
}

/**
 * A failed compile, said out loud.
 *
 * An incomplete download is the likeliest way this goes wrong and the worst at
 * explaining itself: the decompression stream rejects with a `TypeError` whose
 * own message is empty and whose text is on its `cause`. So the reason is dug
 * out of whichever of the two has one, and what it was reading is named.
 */
function compilationFailed(error: unknown, url: string): Error {
  const reason = messageOf(error) || messageOf((error as { cause?: unknown } | null | undefined)?.cause) || String(error);
  return new Error(
    `The TypeScript compiler${url === "" ? "" : ` at ${url}`} could not be compiled: ${reason}. `
      + "An incomplete or corrupted download is the usual cause.",
    { cause: error },
  );
}

function messageOf(error: unknown): string {
  const message = (error as { message?: unknown } | null | undefined)?.message;
  return typeof message === "string" ? message : "";
}

/**
 * Where the compiler is served from, by default.
 *
 * The literal specifier is deliberate: a bundler recognises
 * `new URL("./…", import.meta.url)` and emits the asset for it, which is what
 * makes the default work without the caller naming a path.
 */
function defaultWasmUrl(): URL {
  return new URL("./typescript.wasm.gz", import.meta.url);
}
