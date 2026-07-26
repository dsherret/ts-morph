// Verifies tsconfig parsing through tsgo against a real directory, driven through
// the shipped createFileSystemAdapter rather than a hand-rolled mirror of it.
//
// The adapter is fed a stand-in for ts-morph's TransactionalFileSystem: that
// class itself cannot be loaded here because it uses constructor parameter
// properties, which node's --experimental-strip-types rejects. TsConfigResolver
// is out of reach for the same reason.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/tsconfig-resolver.mts
import assert from "node:assert";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createFileSystemAdapter } from "../packages/common/src/tsgo/fileSystemAdapter.ts";
import { createInProcessApi } from "../packages/common/src/tsgo/inProcessApi.ts";

const dir = mkdtempSync(join(tmpdir(), "tsgo-tsconfig-")).split("\\").join("/");
mkdirSync(join(dir, "src"));
writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({
  compilerOptions: { strict: true, target: "ES2020" },
  include: ["src"],
}));
writeFileSync(join(dir, "src", "a.ts"), "export const a = 1;\n");
writeFileSync(join(dir, "src", "b.ts"), "export const b = 2;\n");
writeFileSync(join(dir, "ignored.txt"), "not typescript\n");

// The subset of TransactionalFileSystem the adapter calls, backed by real disk.
// readDirSync throws for a missing directory, as ts-morph's does — the adapter
// must swallow that rather than let it cross the wasm host boundary.
const transactionalFileSystem = {
  getStandardizedAbsolutePath: (p: string) => p.split("\\").join("/"),
  fileExistsSync: (p: string) => { try { return statSync(p).isFile(); } catch { return false; } },
  directoryExistsSync: (p: string) => { try { return statSync(p).isDirectory(); } catch { return false; } },
  realpathSync: (p: string) => p,
  readFileIfExistsSync: (p: string) => { try { return readFileSync(p, "utf-8"); } catch { return undefined; } },
  writeFileSync: (p: string, content: string) => writeFileSync(p, content),
  readDirSync: (p: string) =>
    readdirSync(p, { withFileTypes: true }).map(e => ({ path: `${p}/${e.name}`, isDirectory: e.isDirectory() })),
};

const fs = createFileSystemAdapter(transactionalFileSystem as never);

// A missing file must read as null ("does not exist"), never undefined: tsgo
// treats undefined as "fall back to your own file system", which for a file
// ts-morph has deleted in memory would read the copy still on disk.
assert.equal(fs.readFile!(`${dir}/nope.ts`), null, "a missing file must read as null, not undefined");
assert.equal(fs.readFile!(`${dir}/src/a.ts`), "export const a = 1;\n");
// And a throwing directory read must not escape.
assert.deepEqual(fs.getAccessibleEntries!(`${dir}/missing`), { files: [], directories: [] });
assert.equal(fs.fileExists!(`${dir}/missing/x.ts`), false);

const api = createInProcessApi({ fs, cwd: dir });
const parsed = api.parseConfigFile(`${dir}/tsconfig.json`);

console.log("options.strict:", parsed.options.strict, "| target:", parsed.options.target);
console.log("fileNames:", parsed.fileNames.map(f => f.replace(dir, "")).sort().join(", "));
assert.equal(parsed.options.strict, true, "compiler options should be read");
assert.equal(parsed.fileNames.length, 2, "should pick up both files under src");
assert.ok(!parsed.fileNames.some(f => f.endsWith(".txt")), "should not include non-TS files");

api.close();
console.log("TSCONFIG RESOLVER OK");
