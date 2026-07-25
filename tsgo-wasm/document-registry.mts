// Exercises the tsgo-backed source file storage that replaces ts.DocumentRegistry
// and its IScriptSnapshot model.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/document-registry.mts
import assert from "node:assert";
import { TsgoDocumentRegistry } from "../packages/common/src/tsgo/documentRegistry.ts";

const registry = new TsgoDocumentRegistry({
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
assert.equal(typeText, '"a"');

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

registry.dispose();
console.log("DOCUMENT REGISTRY OK");
