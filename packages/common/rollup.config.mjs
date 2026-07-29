import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tsgo } from "../rollupPluginTsgo.mjs";

const tsgoPackage = new URL("../../submodules/typescript-go/_packages/native-preview/", import.meta.url);
const emitDir = "./dist-rollup";
const isDeno = process.env.BUILD === "deno";
const isBrowser = process.env.BUILD === "browser";
const outputFolder = isDeno ? "./dist-deno" : "./dist";
// The browser build lands beside the node one rather than in a directory of its
// own, so that the two share the single 9.5 MB `typescript.wasm.gz` the package
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
    // The browser build inlines its two remaining dependencies, so the artifact
    // is loadable as it stands; see `browserDependencies`.
    ...(isBrowser ? browserDependencies() : []),
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
 * `typescript.wasm.gz` no longer points anywhere; it falls back to a copy sitting
 * next to the module that loads it, which is what this emits.
 *
 * Copied rather than compressed here, so that this and `_scripts/build-wasm.mjs`
 * cannot disagree about how: the compiler is gzipped once, where it is built.
 */
function tsgoWasmAsset() {
  return {
    name: "tsgo-wasm-asset",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "typescript.wasm.gz",
        source: readFileSync(fileURLToPath(new URL("dist/typescript.wasm.gz", tsgoPackage))),
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
      // A proxy for the default import, since the shape asked of it varies. The
      // named ones come off the same proxy: `syntheticNamedExports` says so for
      // these modules alone, where `shimMissingExports` would have turned
      // rollup's missing-export error off for the whole build — and a real
      // export going missing has to stay an error.
      return {
        code: `function unavailable() { throw new Error(${JSON.stringify(message)}); }\n`
          + `export default new Proxy({}, { get: () => unavailable });\n`,
        syntheticNamedExports: "default",
      };
    },
  };
}

/**
 * Inlines the two packages the browser build still depends on.
 *
 * `minimatch` and `path-browserify` are the only bare specifiers left in the
 * output once the Node built-ins are stubbed, and a browser resolves neither —
 * so without this the artifact loads only through a bundler, and a plain
 * `<script type="module">` fails on its first line. Node and Deno keep them as
 * ordinary dependencies, resolved at load, which is why this is browser-only.
 *
 * `path-browserify` is CommonJS, which is what the second plugin is for.
 */
function browserDependencies() {
  return [nodeResolve({ browser: true }), commonjs(), inlinedLicenses()];
}

/**
 * Carries the inlined packages' licence notices into the bundle.
 *
 * ISC and MIT both ask that the notice travel with the code, and inlining is
 * what turns a reference to these packages into a copy of them. The list is
 * collected from what actually ended up in the bundle rather than written out,
 * so a new dependency cannot be inlined without its notice.
 */
function inlinedLicenses() {
  const roots = new Set();
  return {
    name: "inlined-licenses",
    transform(_code, id) {
      const root = packageRootOf(id);
      if (root != null)
        roots.add(root);
      return null;
    },
    banner() {
      const notices = [...roots].sort().map(readNotice).filter(notice => notice != null);
      return notices.length === 0 ? "" : `/*!\n${notices.join("\n\n")}\n*/\n`;
    },
  };
}

/** The directory of the npm package a module came from, or undefined for anything else. */
function packageRootOf(id) {
  const normalized = id.replace(/\\/g, "/");
  const index = normalized.lastIndexOf("/node_modules/");
  if (index === -1)
    return undefined;
  const rest = normalized.slice(index + "/node_modules/".length).split("/");
  const segments = rest[0].startsWith("@") ? rest.slice(0, 2) : rest.slice(0, 1);
  return normalized.slice(0, index) + "/node_modules/" + segments.join("/");
}

/** `name@version` and the licence text, for a package directory that has one. */
function readNotice(root) {
  const text = ["LICENSE", "LICENSE.md", "LICENCE", "LICENSE.txt"]
    .map(name => tryReadFile(`${root}/${name}`))
    .find(contents => contents != null);
  if (text == null)
    return undefined;
  const { name, version } = JSON.parse(readFileSync(`${root}/package.json`, "utf8"));
  return `${name}@${version}\n\n${text.trim()}`;
}

function tryReadFile(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return undefined;
  }
}
