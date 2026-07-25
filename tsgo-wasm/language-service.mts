// Exercises the LanguageService capabilities newly routed from internal/ls
// through the API session: formatting and organize-imports, in-process via Wasm.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/language-service.mts
import assert from "node:assert";
import { createInProcessApi } from "./seam.mts";

/** Applies offset-based edits to text, last-first so offsets stay valid. */
function applyEdits(text: string, edits: readonly { pos: number; end: number; newText: string }[]): string {
  return [...edits]
    .sort((a, b) => b.pos - a.pos)
    .reduce((acc, e) => acc.slice(0, e.pos) + e.newText + acc.slice(e.end), text);
}

const unformatted = `export class C{\n      method( a:string ){\nreturn a;\n    }\n}\n`;
const unorganized = `import { z } from "./z";\nimport { a } from "./a";\n\nexport const use = a + z;\n`;

const api = createInProcessApi({
  files: {
    "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
    "/src/format.ts": unformatted,
    "/src/imports.ts": unorganized,
    "/src/a.ts": `export const a = 1;\n`,
    "/src/z.ts": `export const z = 2;\n`,
  },
});

const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;

// 1. Format a whole document.
const formatEdits = project.formatDocument("/src/format.ts");
console.log("formatDocument edits:", formatEdits.length);
assert.ok(formatEdits.length > 0, "expected formatting edits");
const formatted = applyEdits(unformatted, formatEdits);
console.log("--- formatted ---\n" + formatted + "-----------------");
assert.ok(!formatted.includes("method( a:string )"), "spacing should be normalized");

// 2. Format only a range (the first line).
const rangeEdits = project.formatDocumentRange("/src/format.ts", 0, unformatted.indexOf("\n"));
console.log("formatDocumentRange edits:", rangeEdits.length);

// 3. Organize imports.
const importEdits = project.organizeImports("/src/imports.ts");
console.log("organizeImports edits:", importEdits.length);
assert.ok(importEdits.length > 0, "expected organize-imports edits");
const organized = applyEdits(unorganized, importEdits);
console.log("--- organized ---\n" + organized + "-----------------");
assert.ok(
  organized.indexOf(`from "./a"`) < organized.indexOf(`from "./z"`),
  "imports should be sorted",
);

// 4. Rename a symbol across files.
{
  const files: Record<string, string> = {
    "/src/a.ts": `export const a = 1;\n`,
    "/src/imports.ts": unorganized,
  };
  const pos = files["/src/a.ts"].indexOf("a =");
  const renameEdits = project.rename("/src/a.ts", pos, "renamed");
  console.log("rename touched files:", renameEdits.map(f => f.fileName).join(", "));
  assert.ok(renameEdits.length >= 2, "rename should touch the declaration and its importer");
  for (const file of renameEdits) {
    const before = files[file.fileName] ?? "";
    console.log(`  ${file.fileName}: ${file.edits.length} edit(s) -> ${JSON.stringify(applyEdits(before, file.edits).trim())}`);
  }
  const declFile = renameEdits.find(f => f.fileName === "/src/a.ts")!;
  assert.ok(applyEdits(files["/src/a.ts"], declFile.edits).includes("renamed"), "declaration should be renamed");
}

api.close();
console.log("LANGUAGE SERVICE OK");
