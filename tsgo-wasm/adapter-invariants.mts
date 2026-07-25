// Checks the invariants the adapter exists to provide:
//   - getChildren returns identical node objects across calls (ts-morph keys its
//     wrapper cache on compiler-node identity, so this is correctness, not perf)
//   - a mutable SourceFile view accepts fileName/version assignment
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/adapter-invariants.mts
import assert from "node:assert";
import { getChildren, getLastToken } from "../packages/common/src/tsgo/getChildren.ts";
import { createMutableSourceFile, setSourceFileProperty } from "../packages/common/src/tsgo/mutableSourceFile.ts";
import { createInProcessApi } from "./seam.mts";

const api = createInProcessApi({
  files: {
    "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
    "/src/index.ts": `export class C { method(a: string) { return a; } }\n`,
  },
});

const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;
const sourceFile = project.program.getSourceFile("/src/index.ts")!;

// 1. Node identity is stable across repeated calls, including synthesized
//    tokens and SyntaxList nodes (which are created, not stored in the tree).
const first = getChildren(sourceFile);
const second = getChildren(sourceFile);
assert.equal(first, second, "children array should be cached");
for (let i = 0; i < first.length; i++)
  assert.equal(first[i], second[i], `child ${i} should be the same object`);

const syntaxList = first[0];
const listKidsA = getChildren(syntaxList);
const listKidsB = getChildren(syntaxList);
assert.equal(listKidsA, listKidsB, "syntax list children should be cached");

// Deep walk: every node keeps identity, including tokens nested arbitrarily.
let nodes = 0;
(function walk(node: any): void {
  const a = getChildren(node, sourceFile);
  const b = getChildren(node, sourceFile);
  assert.equal(a, b, "repeated getChildren must return the identical array");
  nodes++;
  for (const child of a) walk(child);
})(sourceFile);
console.log(`identity stable across ${nodes} nodes`);

// 2. getLastToken finds the trailing token.
const lastToken = getLastToken(sourceFile)!;
assert.ok(lastToken, "expected a last token");
console.log("last token span:", `[${lastToken.pos},${lastToken.end})`);

// 3. The raw source file rejects fileName assignment; the mutable view accepts it.
assert.throws(() => {
  (sourceFile as any).fileName = "/src/renamed.ts";
}, "raw RemoteSourceFile should reject fileName assignment");

const renamed = createMutableSourceFile(sourceFile, { fileName: "/src/renamed.ts", version: "2" });
assert.equal(renamed.fileName, "/src/renamed.ts");
assert.equal((renamed as any).version, "2");
// Everything else still resolves against the original.
assert.equal(renamed.text, sourceFile.text);
assert.equal(renamed.statements.length, sourceFile.statements.length);
assert.equal(sourceFile.fileName, "/src/index.ts", "original must be untouched");
console.log("mutable view:", renamed.fileName, "| original:", sourceFile.fileName);

setSourceFileProperty(renamed, "fileName", "/src/again.ts");
assert.equal(renamed.fileName, "/src/again.ts");

api.close();
console.log("ADAPTER INVARIANTS OK");
