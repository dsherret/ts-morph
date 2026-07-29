// Exercises the tsgo-backed source file storage that replaces ts.DocumentRegistry
// and its IScriptSnapshot model.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/document-registry.mts
import assert from "node:assert";
import { DocumentRegistry } from "../packages/common/src/tsgo/documentRegistry.ts";

const registry = new DocumentRegistry({
  compilerOptions: { strict: true },
  files: { "/src/index.ts": `export const x: number = 1;\n` },
});

// 1. A seeded file parses.
const initial = registry.getSourceFileOrThrow("/src/index.ts");
assert.equal(initial.statements.length, 1);
console.log("seeded file statements:", initial.statements.length, "version:", registry.getSourceFileVersion("/src/index.ts"));

// 2. Replacing contents reparses and bumps the version.
const updated = registry.createOrUpdateSourceFile("/src/index.ts", `export const x = "a";\nexport const y = 2;\n`);
assert.equal(updated.statements.length, 2);
assert.equal(registry.getSourceFileVersion("/src/index.ts"), "1");
console.log("after update statements:", updated.statements.length, "version:", registry.getSourceFileVersion("/src/index.ts"));

// 3. The checker sees the new text.
const symbol = registry.checker.getSymbolAtPosition("/src/index.ts", "export const ".length)!;
const typeText = registry.checker.typeToString(registry.checker.getTypeOfSymbol(symbol)!);
console.log("typeof x:", typeText);
// a `const` initialized with a literal narrows to that literal type
assert.equal(typeText, "\"a\"");

// 4. Adding a file brings it into the program.
registry.createOrUpdateSourceFile("/src/added.ts", `export const added = true;\n`);
assert.ok(registry.getSourceFile("/src/added.ts"), "added file should be in the program");
console.log("added file present");

// 5. Removing it takes it back out.
registry.removeSourceFile("/src/added.ts");
assert.equal(registry.getSourceFile("/src/added.ts"), undefined, "removed file should be gone");
console.log("removed file absent");

// 6. Diagnostics come from the same project.
const diagnostics = registry.program.getSemanticDiagnostics("/src/index.ts");
console.log("semantic diagnostics:", diagnostics.length);
assert.equal(diagnostics.length, 0);

// 7. Files written without being parsed all arrive together at the next read.
registry.setSourceFileText("/src/first.ts", `export const first = 1;\n`);
registry.setSourceFileText("/src/second.ts", `export const second = 2;\n`);
assert.ok(registry.getSourceFile("/src/first.ts"), "first written file should be in the program");
assert.ok(registry.getSourceFile("/src/second.ts"), "second written file should be in the program");
console.log("written files present");

// 8. Writing a file twice before anything reads it leaves the second text in place.
registry.setSourceFileText("/src/twice.ts", `export const twice = 1;\n`);
registry.setSourceFileText("/src/twice.ts", `export const twice = 2;\nexport const thrice = 3;\n`);
assert.equal(registry.getSourceFileOrThrow("/src/twice.ts").statements.length, 2);
assert.equal(registry.getSourceFileVersion("/src/twice.ts"), "1");
console.log("rewritten file statements:", registry.getSourceFileOrThrow("/src/twice.ts").statements.length);

// 9. A file written and then removed before anything reads it is not in the program.
registry.setSourceFileText("/src/fleeting.ts", `export const fleeting = true;\n`);
registry.removeSourceFile("/src/fleeting.ts", { discardContents: true });
assert.equal(registry.getSourceFile("/src/fleeting.ts"), undefined, "file removed before any read should be gone");
console.log("fleeting file absent");

// 10. Files sharing a stem are all in the project, whichever way they were added.
// This is what the synthetic tsconfig's explicit `files` is for: left to a
// wildcard, the config picks up files by extension priority and drops the rest.
registry.createOrUpdateSourceFile("/src/shared.ts", `export const fromTs = 1;\n`);
registry.setSourceFileText("/src/shared.d.ts", `export declare const fromDts: number;\n`);
registry.setSourceFileText("/src/shared.js", `export const fromJs = 1;\n`);
for (const fileName of ["/src/shared.ts", "/src/shared.d.ts", "/src/shared.js"])
  assert.ok(registry.getSourceFile(fileName), `${fileName} should be in the program`);
console.log("stem collision files present");

registry.dispose();
console.log("DOCUMENT REGISTRY OK");
