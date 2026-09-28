// Design change #1, measured: the SAME tsgo compiler behind the SAME sync API, run
// two ways — in-process WebAssembly vs a native subprocess bridged synchronously
// (SyncRpcChannel: blocking readSync/writeSync over a pipe). The question §2.2 leaves
// open is whether the ~2× gap to 28.0.0 is the Wasm execution tax; if it is, the
// native backend should roughly halve these times.
//
// No repo source is touched. Both backends are driven through the raw
// @typescript/native-preview sync API the way DocumentRegistry drives it.
//
//   node --experimental-strip-types --no-warnings --conditions @typescript/source \
//     tsgo-wasm/bench-native-vs-wasm.mts <exePath> [fileCount] [iterations]
import assert from "node:assert";
import { createVirtualFileSystem } from "../submodules/typescript-go/packages/typescript/dist/api/fs.js";
import { API } from "../submodules/typescript-go/packages/typescript/dist/api/sync/api.js";
import { createWasmAPI } from "../submodules/typescript-go/packages/typescript/dist/api/wasm/api.js";

// the native `tsc` binary, built from the submodule with `go build -o <path> ./tsc/cmd/tsc`
const exe = process.argv[2] || process.env.TSGO_NATIVE_EXE;
if (!exe)
  throw new Error("Pass the path to a native tsc build as the first argument, or set TSGO_NATIVE_EXE.");
const fileCount = Number(process.argv[3] ?? 300);
const iterations = Number(process.argv[4] ?? 7);
const config = "/tsconfig.json";

function makeApi(backend: "wasm" | "subprocess", files: Record<string, string>): any {
  const fs = createVirtualFileSystem(files);
  if (backend === "subprocess")
    return new API({ tsserverPath: exe, cwd: "/", fs } as any);
  return createWasmAPI({ cwd: "/", fs });
}

// ── project of N files, a slice of which have one deliberate error ──
function projectFiles(n: number, libs: string[] | undefined): Record<string, string> {
  const files: Record<string, string> = {
    [config]: JSON.stringify({
      compilerOptions: { strict: true, target: "es2022", module: "esnext", moduleResolution: "bundler", ...(libs ? { lib: libs } : {}) },
      include: ["**/*.ts"],
    }),
  };
  for (let i = 0; i < n; i++) {
    files[`/src/f${i}.ts`] = `export interface T${i} { id: number; name: string; }\n`
      + `export function make${i}(id: number): T${i} { return { id, name: String(id) }; }\n`
      + `export const items${i}: T${i}[] = [1, 2, 3].map(make${i});\n`
      + `export const total${i} = items${i}.reduce((a, b) => a + b.id, 0);\n`;
  }
  return files;
}

function firstDiagnostics(api: any): number {
  const snap = api.createSnapshot({ openProject: config });
  const project = snap.getConfiguredProject(config);
  const diags = project.program.getSemanticDiagnostics();
  return diags.length;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function best(xs: number[]): number {
  return Math.min(...xs);
}

interface Row {
  construct: number[];
  diag: number[];
  diagCount: number;
}

function measure(backend: "wasm" | "subprocess", files: Record<string, string>): Row {
  const row: Row = { construct: [], diag: [], diagCount: -1 };
  // warm once (module instantiation / process spawn + first program build)
  {
    const api = makeApi(backend, files);
    firstDiagnostics(api);
    api.close?.();
  }
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    const api = makeApi(backend, files);
    const t1 = performance.now();
    const count = firstDiagnostics(api);
    const t2 = performance.now();
    api.close?.();
    row.construct.push(t1 - t0);
    row.diag.push(t2 - t1);
    if (row.diagCount === -1) row.diagCount = count;
    else assert.equal(count, row.diagCount, `${backend} diag count unstable`);
  }
  return row;
}

function report(title: string, files: Record<string, string>): void {
  const wasm = measure("wasm", files);
  const sub = measure("subprocess", files);
  assert.equal(wasm.diagCount, sub.diagCount, `PARITY FAIL: wasm ${wasm.diagCount} vs subprocess ${sub.diagCount} diagnostics`);
  console.log(`\n${title} — ${wasm.diagCount} diagnostics, parity OK; best / median of ${iterations}`);
  console.log("| backend | construct | first diagnostics |");
  console.log("| --- | --- | --- |");
  console.log(
    `| wasm | ${best(wasm.construct).toFixed(1)} / ${median(wasm.construct).toFixed(1)} ms | ${best(wasm.diag).toFixed(1)} / ${
      median(wasm.diag).toFixed(1)
    } ms |`,
  );
  console.log(
    `| subprocess | ${best(sub.construct).toFixed(1)} / ${median(sub.construct).toFixed(1)} ms | ${best(sub.diag).toFixed(1)} / ${
      median(sub.diag).toFixed(1)
    } ms |`,
  );
  const speedup = median(wasm.diag) / median(sub.diag);
  console.log(`\n  → subprocess checks ${speedup.toFixed(2)}× ${speedup >= 1 ? "faster" : "SLOWER"} than wasm (median first-diagnostics)`);
}

report(`${fileCount} files, default libs`, projectFiles(fileCount, undefined));
report(`1 file, default libs (DOM)`, projectFiles(1, undefined));
report(`1 file, lib: es2022 only`, projectFiles(1, ["lib.es2022.d.ts"]));
