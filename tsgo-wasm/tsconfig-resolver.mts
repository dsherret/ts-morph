// Verifies tsconfig parsing through tsgo against a real directory, driven by the
// same callbacks the file system adapter supplies from ts-morph's file system.
// (TsConfigResolver itself cannot be loaded here: @ts-morph/common uses
// extensionless directory imports, which only resolve under its own build.)
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/tsconfig-resolver.mts
import assert from "node:assert";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

// Mirrors createFileSystemAdapter: every read is answered from JS.
const fs = {
  fileExists: (p: string) => { try { return statSync(p).isFile(); } catch { return false; } },
  directoryExists: (p: string) => { try { return statSync(p).isDirectory(); } catch { return false; } },
  realpath: (p: string) => p,
  readFile: (p: string) => { try { return readFileSync(p, "utf-8"); } catch { return undefined; } },
  getAccessibleEntries: (p: string) => {
    const files: string[] = [];
    const directories: string[] = [];
    for (const entry of readdirSync(p, { withFileTypes: true }))
      (entry.isDirectory() ? directories : files).push(entry.name);
    return { files, directories };
  },
};

const api = createInProcessApi({ fs, cwd: dir });
const parsed = api.parseConfigFile(`${dir}/tsconfig.json`);

console.log("options.strict:", parsed.options.strict, "| target:", parsed.options.target);
console.log("fileNames:", parsed.fileNames.map(f => f.replace(dir, "")).sort().join(", "));
assert.equal(parsed.options.strict, true, "compiler options should be read");
assert.equal(parsed.fileNames.length, 2, "should pick up both files under src");
assert.ok(!parsed.fileNames.some(f => f.endsWith(".txt")), "should not include non-TS files");

api.close();
console.log("TSCONFIG RESOLVER OK");
