import { expect } from "chai";
import { createVirtualFileSystem } from "../../../../../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import { createWasmAPI } from "../../../../../submodules/typescript-go/_packages/native-preview/dist/api/wasm/api.js";
import { initializeWasm } from "../../tsgo/wasmModule";

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
    await initializeWasm();

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
  });
});
