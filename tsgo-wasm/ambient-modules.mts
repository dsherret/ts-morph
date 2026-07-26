// Verifies getAmbientModules, restored by exposing the Go checker's existing
// GetAmbientModules through the API.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/ambient-modules.mts
import assert from "node:assert";
import { createInProcessApi } from "./seam.mts";

const api = createInProcessApi({
  files: {
    "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
    "/ambient.d.ts": `declare module "my-lib" {\n  export const a: number;\n}\ndeclare module "other-lib" {\n  export const b: string;\n}\n`,
    "/src/index.ts": `export const x = 1;\n`,
  },
});

const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;

const modules = project.checker.getAmbientModules();
const names = modules.map(m => m.name).sort();
console.log("ambient modules:", names.join(", "));
assert.ok(names.includes(`"my-lib"`), `expected "my-lib" among ${names.join(", ")}`);
assert.ok(names.includes(`"other-lib"`), `expected "other-lib" among ${names.join(", ")}`);

// the symbols must be usable, not just named
const exports = project.checker.getExportsOfModule(modules.find(m => m.name === `"my-lib"`)!);
console.log("exports of my-lib:", exports.map(e => e.name).join(", "));
assert.ok(exports.some(e => e.name === "a"), "expected export 'a'");

api.close();
console.log("AMBIENT MODULES OK");
