// Proves the module resolution callback: the host, not the compiler, decides
// where a specifier points.
//
// The case that motivated it is Deno's, where a specifier is mapped by rules
// the compiler does not implement. `my-alias` resolves under none of its own
// modes — there is no node_modules here — so if the checker follows it to a real
// class, the host must have been asked.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/custom-resolution.mts
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createVirtualFileSystem } from "../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import { createWasmAPI } from "../submodules/typescript-go/_packages/native-preview/dist/api/wasm/api.js";

// The loader no longer reads the module: where it comes from is the host's
// decision, which is what lets the same loader run in a browser. Compile once
// and instantiate it per API, the way `@ts-morph/common` does. The shipped
// reactor is gzipped, so unwrap it first.
const wasm = new WebAssembly.Module(
  gunzipSync(readFileSync(new URL("../submodules/typescript-go/_packages/native-preview/dist/typescript.wasm.gz", import.meta.url))),
);

const files = {
  "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true, noLib: true } }),
  "/Test.ts": `export class Test { prop = 1; }\n`,
  "/main.ts": `import { Test } from "my-alias";\nexport const value = new Test().prop;\n`,
};

// 1. Without the callback the specifier does not resolve, so the import is an error.
{
  const api = createWasmAPI({ wasm, cwd: "/", fs: createVirtualFileSystem(files) });
  const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
  const project = snapshot.getProject("/tsconfig.json")!;
  const diagnostics = project.program.getSemanticDiagnostics("/main.ts");
  assert.ok(
    diagnostics.some(d => d.text.includes("my-alias")),
    `expected an unresolved-module error, got ${JSON.stringify(diagnostics.map(d => d.text))}`,
  );
  console.log("without the callback:", diagnostics[0]!.text);
  api.close();
}

// 2. With it, a host that maps the alias resolves the import.
{
  const asked: string[] = [];
  const api = createWasmAPI({
    wasm,
    cwd: "/",
    fs: createVirtualFileSystem(files),
    resolveModuleName: ({ moduleName, containingFile }) => {
      asked.push(`${moduleName} from ${containingFile}`);
      if (moduleName !== "my-alias")
        return undefined; // no opinion; the compiler resolves it
      return { resolved: { resolvedFileName: "/Test.ts" } };
    },
  });
  const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
  const project = snapshot.getProject("/tsconfig.json")!;

  const diagnostics = project.program.getSemanticDiagnostics("/main.ts");
  assert.deepEqual(diagnostics.map(d => d.text), [], "the import should resolve");

  assert.ok(asked.length > 0, "the host should have been asked");
  console.log("asked about:", asked.join(", "));

  // the checker followed the resolution into the file the host named
  const main = project.program.getSourceFile("/main.ts")!;
  const declaration = (main as any).statements[1].declarationList.declarations[0];
  const type = project.checker.getTypeAtLocation(declaration.name);
  assert.equal(project.checker.typeToString(type), "number");
  console.log("resolved type of value:", project.checker.typeToString(type));
  api.close();
}

// 3. A host that resolves to nothing is believed, and the compiler does not
//    second-guess it — `./Test` would resolve on its own, and does not here.
{
  const api = createWasmAPI({
    wasm,
    cwd: "/",
    fs: createVirtualFileSystem({
      ...files,
      "/main.ts": `import { Test } from "./Test";\nexport const value = new Test().prop;\n`,
    }),
    resolveModuleName: () => ({ resolved: null }),
  });
  const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
  const project = snapshot.getProject("/tsconfig.json")!;
  const diagnostics = project.program.getSemanticDiagnostics("/main.ts");
  assert.ok(diagnostics.some(d => d.text.includes("./Test")), "resolving to nothing should stand");
  console.log("resolved to nothing:", diagnostics[0]!.text);
  api.close();
}

// 4. A host that only rewrites hands back a specifier and lets the compiler
//    resolve it, which is the Deno case: `./Test.ts` is written where node would
//    write `./Test`, and stripping the extension is the whole of the host's job.
{
  const api = createWasmAPI({
    wasm,
    cwd: "/",
    fs: createVirtualFileSystem({
      ...files,
      "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true, noLib: true, allowImportingTsExtensions: true } }),
      "/main.ts": `import { Test } from "./Test.ts";\nexport const value = new Test().prop;\n`,
    }),
    resolveModuleName: ({ moduleName }) => moduleName.endsWith(".ts") ? { moduleName: moduleName.slice(0, -".ts".length) } : undefined,
  });
  const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
  const project = snapshot.getProject("/tsconfig.json")!;
  const diagnostics = project.program.getSemanticDiagnostics("/main.ts");
  assert.deepEqual(diagnostics.map(d => d.text), [], "the rewritten specifier should resolve");
  assert.ok(project.program.getSourceFileNames().includes("/Test.ts"), "the resolved file should be in the program");
  console.log("rewritten ./Test.ts resolved, program:", project.program.getSourceFileNames().join(", "));
  api.close();
}

console.log("CUSTOM RESOLUTION OK");
