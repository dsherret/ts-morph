import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const tsgoPackage = new URL("../../submodules/typescript-go/_packages/native-preview/", import.meta.url);
const isDeno = process.env.BUILD === "deno";
const outputFolder = isDeno ? "./dist-deno" : "./dist";
const moduleKind = isDeno ? "es" : "cjs";

export default [{
  input: ["./src/index.ts"],
  external: [],
  output: {
    file: outputFolder + "/ts-morph-common.js",
    format: moduleKind,
    interop: "compat",
  },
  plugins: [
    tsgoInternalImports(),
    tsgoWasmAsset(),
    typescript({
      tsconfig: "tsconfig.rollup.json",
      outDir: outputFolder,
      experimentalDecorators: false,
    }),
  ],
}];

/**
 * Resolves the tsgo client's package-internal `#` specifiers.
 *
 * The tsgo client's modules are inlined into this bundle, but their `#enums/*`
 * style imports are only resolvable through that package's own `imports` map.
 * Left alone they stay external and the bundle throws
 * `Cannot find module '#enums/modifierFlags'` on load, so map them the same way
 * the package's `imports` field does.
 */
function tsgoInternalImports() {
  const resolve = path => fileURLToPath(new URL(path, tsgoPackage));
  return {
    name: "tsgo-internal-imports",
    resolveId(source) {
      if (source.startsWith("#enums/"))
        return resolve(`dist/enums/${source.slice("#enums/".length)}.js`);
      if (source === "#getExePath")
        return resolve("lib/getExePath.js");
      if (source === "#vscode-jsonrpc/node")
        return resolve("vendor/vscode-jsonrpc/lib/node/main.js");
      return null;
    },
  };
}

/**
 * Ships the tsgo reactor beside the bundle.
 *
 * The wasm loader is inlined here, so its in-package relative path to
 * `typescript.wasm` no longer points anywhere; it falls back to a copy sitting
 * next to the module that loads it, which is what this emits.
 */
function tsgoWasmAsset() {
  return {
    name: "tsgo-wasm-asset",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "typescript.wasm",
        source: readFileSync(fileURLToPath(new URL("dist/typescript.wasm", tsgoPackage))),
      });
    },
  };
}
