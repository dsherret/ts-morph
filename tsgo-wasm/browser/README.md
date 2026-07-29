# ts-morph in a browser

ts-morph runs in a browser. Two things have to be true, and neither is optional:

1. **It runs in a Web Worker, not on the main thread.** V8 refuses both
   `new WebAssembly.Module` and `new WebAssembly.Instance` above 8 MB on the main
   thread, and the compiler is 43 MB — so even "compile asynchronously, then do
   everything synchronously" fails there. Inside a worker the browser behaves the
   way Node does: a synchronous compile takes ~27 ms and a synchronous
   instantiation ~4 ms, so every existing synchronous call site works unchanged.
2. **`await initializeWasm()` before the first `Project`.** Node and Deno read
   `typescript.wasm` from beside the bundle synchronously; a browser has no
   synchronous way to reach a 43 MB asset, so it fetches and compiles it once, up
   front. Everything after that is synchronous exactly as it is elsewhere.

```js
import { initializeWasm, Project } from "ts-morph";

// once, at worker startup; the default is `typescript.wasm` beside the bundle
await initializeWasm();

const project = new Project({ useInMemoryFileSystem: true });
const file = project.createSourceFile("/src/main.ts", "export const x: number = 1;");
console.log(file.getVariableDeclarationOrThrow("x").getType().getText());
```

`initializeWasm` also takes the module from wherever you already have it:

```js
await initializeWasm({ wasm: fetch("/assets/typescript.wasm") });
await initializeWasm({ wasm: await caches.match("/assets/typescript.wasm") });
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

- **Serve `typescript.wasm` as `application/wasm`.** `WebAssembly.compileStreaming`
  rejects anything else, in Chrome and in Node alike. `initializeWasm` falls back
  to buffering the response when the content type is wrong, which works but
  throws away the point of streaming.
- **Sizes**: 43.0 MB raw, 9.6 MB gzip, 8.1 MB brotli (quality 5). Serve it
  compressed.
- **The HTTP cache will not keep it.** Chrome caps a single cache entry at about
  1/8 of the disk cache; the cut-off measured on one machine sat between 27 MB
  and 33 MB, well under this. Without an explicit `Cache` entry every page load
  re-downloads the whole thing. A `caches.match` hit into `compileStreaming` is
  ~91 ms with no network at all, so it is worth doing:

  ```js
  const cache = await caches.open("ts-morph");
  let response = await cache.match("/assets/typescript.wasm");
  if (response == null) {
    await cache.add("/assets/typescript.wasm");
    response = await cache.match("/assets/typescript.wasm");
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

The compiler is located with a literal `new URL("./typescript.wasm", import.meta.url)`.

- **Vite** copies the asset and rewrites the URL. Nothing to do.
- **esbuild** emits the `new URL(...)` verbatim and copies nothing, so the URL
  dangles with no error. Pass `--loader:.wasm=file`, or call
  `initializeWasm({ wasm: fetch(yourOwnUrl) })` and place the file yourself.
- **Any bundler**: `initializeWasm({ wasm: … })` sidesteps asset handling entirely.

## The acceptance test

```sh
npm run build          # at the repository root
node tsgo-wasm/browser/run.mjs
```

`run.mjs` asserts that the shipped browser build imports nothing at all — no Node
built-ins, no bare specifiers, which is what a browser can actually load — then
bundles [`worker.ts`](./worker.ts) for the browser with `deno bundle`, asserts
the same of the result, serves it beside `typescript.wasm`, and drives headless
Chrome at it. The shipped artifact is checked separately because `deno bundle`
would inline anything it still imported, and so hide it. The worker parses, queries
the checker, reads diagnostics, manipulates, emits, and then adds fifty more
files and re-checks. It exits 0 only on `RESULT: OK`.

`--serve` leaves the server up instead, for looking at the page by hand.
`CHROME_PATH` overrides browser discovery.
