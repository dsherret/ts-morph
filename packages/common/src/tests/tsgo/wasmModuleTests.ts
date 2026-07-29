import { expect } from "chai";
import { readFileSync } from "node:fs";
import { createVirtualFileSystem } from "../../../../../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import { createWasmAPI, getDefaultWasmModule } from "../../../../../submodules/typescript-go/_packages/native-preview/dist/api/wasm/api.js";
import { initializeWasm } from "../../tsgo/wasmModule";

/**
 * Declared locally for the same reason the source does it: this package's `lib`
 * has no DOM, which is where TypeScript declares the WebAssembly globals.
 */
declare const WebAssembly: {
  compile(bytes: Uint8Array): Promise<object>;
};

/**
 * `initializeWasm` exists for the browser, where the compiler cannot be read
 * synchronously. It still has to be harmless everywhere else, because a library
 * that runs in both places will call it in both places.
 */
describe("initializeWasm", () => {
  it("should be a no-op that leaves the compiler usable off disk", async () => {
    // the default here is a `file:` URL, which `fetch` cannot read: this must
    // reach the file system rather than the network
    await initializeWasm();
    const compiled = getDefaultWasmModule();
    // a second call has nothing left to do, so it must not compile the reactor
    // all over again
    await initializeWasm();

    expect(getDefaultWasmModule()).to.equal(compiled);
    expectCompilerWorks();
  });

  it("should take an already compiled module", async () => {
    // The path a browser is meant to take with more than one worker: compile the
    // reactor once, `postMessage` the module to each worker, and hand it over
    // here. A module cannot be compiled from a `file:` URL, so the bytes are
    // read the way a page would have fetched them.
    const module = await WebAssembly.compile(readFileSync(wasmPath()));
    await initializeWasm({ wasm: module });

    // the module the caller compiled is the one every session now instantiates,
    // rather than one compiled a second time from somewhere else
    expect(getDefaultWasmModule()).to.equal(module);
    expectCompilerWorks();
  });

  it("should take bytes", async () => {
    const previous = getDefaultWasmModule();
    await initializeWasm({ wasm: readFileSync(wasmPath()) });

    expect(getDefaultWasmModule()).to.not.equal(previous);
    expectCompilerWorks();
  });

  it("should take a response, compiling it off the stream", async () => {
    // The browser's path: what `fetch("/typescript.wasm")` answers, served the
    // only way `compileStreaming` accepts. This is the same code a page runs.
    const previous = getDefaultWasmModule();
    await initializeWasm({ wasm: new Response(readFileSync(wasmPath()), { headers: { "content-type": "application/wasm" } }) });

    expect(getDefaultWasmModule()).to.not.equal(previous);
    expectCompilerWorks();
  });

  it("should take a promise of a module, the same as a promise of a response", async () => {
    // `initializeWasm({ wasm: fetch(url) })` is documented, so an un-awaited
    // anything-else has to land somewhere sensible rather than in the middle of
    // the response path
    const module = WebAssembly.compile(readFileSync(wasmPath()));
    await initializeWasm({ wasm: module as unknown as ArrayBuffer });

    expect(getDefaultWasmModule()).to.equal(await module);
  });

  it("should say what went wrong when the download is incomplete", async () => {
    // The likeliest real failure, and the one worst at explaining itself: what
    // the compiler rejects a half-arrived module with says nothing about where it
    // came from, and can be carried on the error's `cause` rather than on itself.
    const unchanged = getDefaultWasmModule();
    const truncated = readFileSync(wasmPath()).subarray(0, 1024);
    let message = "";
    try {
      await initializeWasm({ wasm: new Response(truncated) });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).to.contain("could not be compiled");
    expect(message).to.contain("An incomplete or corrupted download is the usual cause");
    expect(message).to.not.contain(": .");
    expect(getDefaultWasmModule()).to.equal(unchanged);
  });

  it("should say so when given something it cannot load the compiler from", async () => {
    // A compiled module has no members, so the option's type accepts anything;
    // a file path is what a caller reaches for first and it has to say why that
    // is not it, rather than fail somewhere further down.
    const unchanged = getDefaultWasmModule();
    let message = "";
    try {
      await initializeWasm({ wasm: "./typescript.wasm" as unknown as ArrayBuffer });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).to.contain("not a source the compiler can be loaded from");
    expect(message).to.contain("A file path is not one of them");
    expect(getDefaultWasmModule()).to.equal(unchanged);
  });
});

/** Where the reactor sits in the tsgo client this package builds against. */
function wasmPath() {
  return new URL("../../../../../submodules/typescript-go/_packages/native-preview/dist/typescript.wasm", import.meta.url);
}

/** That whatever `initializeWasm` last supplied is what a new session runs on. */
function expectCompilerWorks() {
  const api = createWasmAPI({
    cwd: "/",
    fs: createVirtualFileSystem({
      "/tsconfig.json": "{}",
      "/main.ts": "export const value: number = 1;\n",
    }),
  });
  try {
    const project = api.updateSnapshot({ openProject: "/tsconfig.json" }).getProject("/tsconfig.json")!;
    expect(project.program.getSemanticDiagnostics("/main.ts").length).to.equal(0);
  } finally {
    api.close();
  }
}
