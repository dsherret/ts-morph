import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tsgo } from "../rollupPluginTsgo.mjs";

const tsgoPackage = new URL("../../submodules/typescript-go/_packages/native-preview/", import.meta.url);
const emitDir = "./dist-rollup";
const isDeno = process.env.BUILD === "deno";
const isBrowser = process.env.BUILD === "browser";
const outputFolder = isDeno ? "./dist-deno" : "./dist";
// The browser build lands beside the node one rather than in a directory of its
// own, so that the two share the single 43 MB `typescript.wasm` the package
// ships. `.mjs` because the package is CommonJS by default and this output is
// not.
const outputFile = isBrowser ? "/ts-morph-common.browser.mjs" : "/ts-morph-common.js";
// A browser gets ES modules for the same reason Deno does, and for one more:
// rollup's CommonJS shim for `import.meta.url` resolves through
// `document.currentScript` or `document.baseURI`, which is the page's location
// rather than the emitted asset's — so the reactor would be looked for in the
// wrong place.
const moduleKind = isDeno || isBrowser ? "es" : "cjs";

export default [{
  input: [emitDir + "/index.js"],
  external: [],
  // Only the browser build has stubs standing in for modules it cannot have, and
  // only those stubs are missing exports. Elsewhere a missing export is a bug.
  shimMissingExports: isBrowser,
  output: {
    file: outputFolder + outputFile,
    format: moduleKind,
    interop: "compat",
  },
  plugins: [
    tsgoInternalImports(),
    tsgoWasmAsset(),
    ...(isBrowser ? [browserStubs()] : []),
    tsgo({ tsconfig: "tsconfig.rollup.json", emitDir }),
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

/**
 * Replaces the modules a browser cannot have with stubs that say so.
 *
 * Every one of them is reachable only from a code path a browser never takes —
 * the Node runtime, the subprocess transport, and locating a tsgo executable —
 * but a bare `node:fs` specifier in the output is still a module a browser
 * cannot resolve, and resolution happens before any of that code runs. Stubbing
 * is what makes the bundle loadable; nothing here is meant to be called.
 *
 * `tinyglobby` is stubbed for the same reason the `browser` field already maps
 * it away: it reads the disk.
 */
function browserStubs() {
  const stubbed = new Set([
    "node:fs",
    "node:fs/promises",
    "node:os",
    "node:path",
    "node:module",
    "node:url",
    "node:child_process",
    "tinyglobby",
  ]);
  const prefix = "\0browser-stub:";
  return {
    name: "browser-stubs",
    resolveId(source) {
      return stubbed.has(source) ? prefix + source : null;
    },
    load(id) {
      if (!id.startsWith(prefix))
        return null;
      const specifier = id.slice(prefix.length);
      const message = `"${specifier}" is not available in a browser. `
        + "Use an in-memory file system (`useInMemoryFileSystem: true`), and see tsgo-wasm/browser/README.md.";
      // A proxy for the default import, since the shape asked of it varies; the
      // named ones rollup fills in itself (see `shimMissingExports`).
      return `function unavailable() { throw new Error(${JSON.stringify(message)}); }\n`
        + `export default new Proxy({}, { get: () => unavailable });\n`;
    },
  };
}
