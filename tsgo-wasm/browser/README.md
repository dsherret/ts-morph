# ts-morph in a browser

ts-morph runs in a browser. Two things have to be true, and neither is optional:

1. **It runs in a Web Worker, not on the main thread.** V8 refuses both
   `new WebAssembly.Module` and `new WebAssembly.Instance` above 8 MB on the main
   thread, and the compiler is 43 MB — so even "compile asynchronously, then do
   everything synchronously" fails there. Inside a worker the browser behaves the
   way Node does: a synchronous compile takes ~27 ms and a synchronous
   instantiation ~4 ms, so every existing synchronous call site works unchanged.
2. **`await initializeWasm()` before the first `Project`.** Node and Deno read
   `typescript.wasm.gz` from beside the bundle synchronously; a browser has no
   synchronous way to reach an asset that size, so it fetches, gunzips and
   compiles it once, up front. Everything after that is synchronous exactly as it
   is elsewhere.

```js
import { initializeWasm, Project } from "ts-morph";

// once, at worker startup; the default is `typescript.wasm.gz` beside the bundle
await initializeWasm();

const project = new Project({ useInMemoryFileSystem: true });
const file = project.createSourceFile("/src/main.ts", "export const x: number = 1;");
console.log(file.getVariableDeclarationOrThrow("x").getType().getText());
```

`initializeWasm` also takes the module from wherever you already have it:

```js
await initializeWasm({ wasm: fetch("/assets/typescript.wasm.gz") });
await initializeWasm({ wasm: await caches.match("/assets/typescript.wasm.gz") });
await initializeWasm({ wasm: bytesTransferredFromTheMainThread });
// already compiled, on this thread or on another one — see the module note below
await initializeWasm({ wasm: await WebAssembly.compile(bytes) });
await initializeWasm({ wasm: modulePostedFromAnotherWorker });
```

There is **no file system**: use `useInMemoryFileSystem: true`. Every Node
built-in is stubbed out of the browser build, and touching one — through a real
`FileSystemHost`, say — throws with the name of the module it wanted.

**No cross-origin isolation is required.** Nothing on this path constructs a
`SharedArrayBuffer`, so the page needs no COOP/COEP headers.

## Serving the compiler

- **The asset ships gzipped**, 9.50 MiB where the module itself is 43.02 MiB.
  `initializeWasm` reads the gzip magic number off the first two bytes and pipes
  the body through a `DecompressionStream` into `compileStreaming`, so the reactor
  compiles while it is still arriving. Bytes that are already the raw module are
  passed straight through, so a decompressed copy works just as well.
- **Serve it as it is.** `application/gzip` (or anything else) is fine — the
  content type is not consulted. What matters is that the bytes arrive
  **compressed**: a server that sends `content-encoding: gzip` has the browser
  unwrap them first, which costs a decompression either way and re-inflates the
  download only if the file is served raw as well.
- **The gunzip costs about 60 ms**, once per page. Measured in Chrome and in
  Node; `WebAssembly.compile` of the 43 MiB module is only ~20 ms next to it,
  because V8 compiles Wasm functions lazily. The trade is 33.5 MiB of download
  for those 60 ms.
- **The HTTP cache will not keep the raw file.** Chrome caps a single cache entry
  at about 1/8 of the disk cache; the cut-off measured on one machine sat between
  27 MB and 33 MB. At 9.5 MiB the compressed asset is comfortably under that, but
  an explicit `Cache` entry is still the dependable answer, and a `caches.match`
  hit into `compileStreaming` needs no network at all:

  ```js
  const cache = await caches.open("ts-morph");
  let response = await cache.match("/assets/typescript.wasm.gz");
  if (response == null) {
    await cache.add("/assets/typescript.wasm.gz");
    response = await cache.match("/assets/typescript.wasm.gz");
  }
  await initializeWasm({ wasm: response });
  ```

- **IndexedDB cannot store a compiled `WebAssembly.Module`** — it fails with
  `DOMException: … can not be serialized for storage`. `postMessage` transfer to a
  worker does work, so compile once and hand the module to every worker that
  needs it — `initializeWasm({ wasm: theModule })` takes a compiled module — or
  cache the _bytes_ rather than the module. Whoever creates the `Project` still
  has to be a worker: that is where the synchronous instantiation happens.

## Bundlers

The browser build is an ES module: `packages/common/dist/ts-morph-common.browser.mjs`,
reached through the `browser` field in `@ts-morph/common`'s `package.json`. Vite,
webpack and esbuild all pick it up on their own.

**That artifact needs no bundler of its own.** It imports nothing at all: the two
packages it uses in a browser, `minimatch` and `path-browserify`, are inlined
into it, and everything it does not use there — every Node built-in, plus
`tinyglobby`, which reads the disk — is replaced by a stub that throws with the
name of what was wanted. So a plain `<script type="module">` loads it, and the
acceptance test asserts on every run that no bare specifier has crept back in.

`ts-morph` itself is a different matter: its own build is CommonJS
(`dist/ts-morph.js`), so reaching the full library from a browser still goes
through a bundler, which is what the acceptance test does with `deno bundle`.

The compiler is located with a literal `new URL("./typescript.wasm.gz", import.meta.url)`.

- **Vite** copies the asset and rewrites the URL. Nothing to do.
- **esbuild** emits the `new URL(...)` verbatim and copies nothing, so the URL
  dangles with no error. Pass `--loader:.gz=file`, or call
  `initializeWasm({ wasm: fetch(yourOwnUrl) })` and place the file yourself.
- **Any bundler**: `initializeWasm({ wasm: … })` sidesteps asset handling entirely.

A `.gz` rather than a `.wasm` holding gzipped bytes, because the extension is what
tools go by: a bundler's Wasm loader, or anything that reads the file, would take
a `.wasm` at its word and fail on the first byte. Nothing outside a browser needs
the file to keep that name either — Node and Deno gunzip it as they read it, and
both accept an unwrapped `typescript.wasm` beside it if a build cannot carry a
`.gz` through.

## The acceptance test

```sh
npm run build          # at the repository root
node tsgo-wasm/browser/run.mjs
```

`run.mjs` asserts that the shipped browser build imports nothing at all — no Node
built-ins, no bare specifiers, which is what a browser can actually load — then
bundles [`worker.ts`](./worker.ts) for the browser with `deno bundle`, asserts
the same of the result, serves it beside `typescript.wasm.gz`, and drives headless
Chrome at it. The shipped artifact is checked separately because `deno bundle`
would inline anything it still imported, and so hide it. The worker parses, queries
the checker, reads diagnostics, manipulates, emits, and then adds fifty more
files and re-checks. It exits 0 only on `RESULT: OK`.

It also pins down that the compressed path is the one being exercised: the driver
refuses to run unless the asset it serves is gzipped and no raw `typescript.wasm`
sits beside it, and the worker reads the first bytes off the wire and asserts they
are gzip before loading the compiler both ways — from the default URL, and from a
`Response` it fetched itself.

`--serve` leaves the server up instead, for looking at the page by hand.
`CHROME_PATH` overrides browser discovery.
