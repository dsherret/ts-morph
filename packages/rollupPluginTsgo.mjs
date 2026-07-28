import { spawnSync } from "node:child_process";
import { rmSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const submoduleDir = fileURLToPath(new URL("../submodules/typescript-go/", import.meta.url));
const tsgoExePath = fileURLToPath(new URL(`../.tsgo/tsgo${process.platform === "win32" ? ".exe" : ""}`, import.meta.url));

/**
 * Compiles a package with tsgo, then lets rollup bundle what it emitted.
 *
 * This replaces `@rollup/plugin-typescript`, which needs the npm `typescript`
 * package to run the compiler in-process. tsgo is the compiler now and it offers
 * no in-process transform — only a `tsc`-compatible CLI — so the TypeScript step
 * runs to a directory ahead of the bundle rather than inside it.
 *
 * `emitDir` has to sit directly inside the package, at the same depth as `src`:
 * the emitted modules keep the relative specifiers they were written with, and
 * `@ts-morph/common` reaches out of its own directory into the tsgo submodule.
 */
export function tsgo({ tsconfig, emitDir }) {
  return {
    name: "tsgo",
    buildStart() {
      // the compiler comes first, so that failing to build it leaves the last
      // emit in place rather than nothing at all
      buildTsgo();
      // tsgo writes over an existing outDir without clearing it, so a file
      // deleted from `src` would otherwise stay behind and keep resolving
      rmSync(emitDir, { force: true, recursive: true });
      run(tsgoExePath, ["-p", tsconfig, "--outDir", emitDir], process.cwd());
    },
    resolveId(source, importer) {
      // `importHelpers` has the emitted modules import their helpers from tslib
      // rather than declare a copy each. Point rollup at the ES build of it so
      // the bundle carries one tree-shaken copy, the way it always has —
      // resolved from the package being built, which is what declares tslib.
      if (source === "tslib")
        return createRequire(path.join(process.cwd(), "package.json")).resolve("tslib/tslib.es6.js");
      if (importer == null || !source.startsWith("."))
        return null;

      // The emitted modules carry the extensionless relative specifiers their
      // sources were written with, which rollup does not complete on its own.
      // Specifiers that already name a file — the tsgo client's own `.js` ones —
      // fall out of the first candidate.
      const resolved = path.resolve(path.dirname(importer), source);
      for (const candidate of [resolved, `${resolved}.js`, path.join(resolved, "index.js")]) {
        if (isFile(candidate))
          return candidate;
      }
      return null;
    },
  };
}

/**
 * Builds the tsgo CLI out of the submodule.
 *
 * Nothing distributes a tsgo binary for this fork, so the build has to produce
 * its own compiler. Go's build cache makes a repeat run take well under a second,
 * which is cheap enough to do unconditionally and means a fresh clone needs no
 * separate setup step.
 */
function buildTsgo() {
  run("go", ["build", "-o", tsgoExePath, "./cmd/tsgo"], submoduleDir);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.error != null)
    throw result.error;
  if (result.status !== 0)
    throw new Error(`\`${command} ${args.join(" ")}\` exited with code ${result.status}.`);
}

function isFile(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}
