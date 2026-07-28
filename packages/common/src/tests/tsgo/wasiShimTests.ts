import { expect } from "chai";
import { createVirtualFileSystem } from "../../../../../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import { createWasmAPI } from "../../../../../submodules/typescript-go/_packages/native-preview/dist/api/wasm/api.js";

/**
 * The safety argument for replacing `node:wasi` with a hand-written shim is that
 * the reactor only ever asks for the clocks, randomness, its argument vector and
 * a one-time probe of stdio — everything else the WASI ABI defines is delegated
 * to JavaScript through the `ts_host` callbacks and is never reached.
 *
 * These tests are that claim as a regression guard. If a change to the Go side
 * starts touching a file, or opens a directory, or crashes, the shim reports it
 * here rather than in an unexplained failure somewhere else.
 */
describe("wasi shim", () => {
  function runCheck() {
    const unsupported: string[] = [];
    const output: string[] = [];
    const api = createWasmAPI({
      cwd: "/",
      fs: createVirtualFileSystem({
        "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
        "/main.ts": "export const values: number[] = [1, 2, 3];\nexport const total = values.reduce((a, b) => a + b, 0);\n",
      }),
      wasi: {
        onUnsupported: name => unsupported.push(name),
        onStdout: text => output.push(text),
        onStderr: text => output.push(text),
      },
    });
    try {
      const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
      const project = snapshot.getProject("/tsconfig.json")!;
      // a real check, so the libs are read and the checker runs
      expect(project.program.getSemanticDiagnostics("/main.ts").length).to.equal(0);
      return { unsupported, output };
    } finally {
      api.close();
    }
  }

  it("should not reach an unimplemented import, over two sessions", () => {
    // two, because most of the WASI traffic is at instance startup and a second
    // instance is what a second `Project` costs
    const first = runCheck();
    const second = runCheck();
    expect(first.unsupported).to.deep.equal([]);
    expect(second.unsupported).to.deep.equal([]);
  });

  it("should write nothing to stdout or stderr", () => {
    // the reactor only writes there on a Go runtime fatal error
    expect(runCheck().output).to.deep.equal([]);
  });
});
