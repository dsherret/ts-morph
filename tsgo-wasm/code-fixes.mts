// Exercises getCodeFixes: quick fixes for a span, optionally restricted to
// specific diagnostic codes.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/code-fixes.mts
import assert from "node:assert";
import { createInProcessApi } from "./seam.mts";

// `missing` is undeclared but exported from ./lib, so the fix is to import it.
const broken = `export const value = missing + 1;\n`;

const files: Record<string, string> = {
  "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
  "/src/lib.ts": `export const missing = 1;\n`,
  "/src/broken.ts": broken,
};

const api = createInProcessApi({ files });
const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;

function applyEdits(text: string, edits: readonly { pos: number; end: number; newText: string }[]): string {
  return [...edits]
    .sort((a, b) => b.pos - a.pos)
    .reduce((acc, e) => acc.slice(0, e.pos) + e.newText + acc.slice(e.end), text);
}

const diagnostics = project.program.getSemanticDiagnostics("/src/broken.ts");
console.log("diagnostics:", diagnostics.length, diagnostics.map(d => d.code).join(", "));
assert.ok(diagnostics.length > 0, "expected a diagnostic for the undeclared name");

const pos = broken.indexOf("missing");
const fixes = project.getCodeFixes("/src/broken.ts", pos, pos + "missing".length);
console.log("fixes:", fixes.map(f => f.description).join(" | ") || "(none)");
assert.ok(fixes.length > 0, "expected at least one quick fix");

const importFix = fixes.find(f => f.description.includes("import")) ?? fixes[0];
const change = importFix.changes.find(c => c.fileName === "/src/broken.ts")!;
const fixed = applyEdits(broken, change.edits);
console.log("--- fixed ---\n" + fixed + "-------------");
assert.ok(fixed.includes(`from "./lib"`), "expected an import to be added");

// Restricting to an unrelated error code yields nothing.
const none = project.getCodeFixes("/src/broken.ts", pos, pos + 1, [9999]);
assert.equal(none.length, 0, "unrelated error codes should produce no fixes");
console.log("error-code filter respected");

api.close();
console.log("CODE FIXES OK");
