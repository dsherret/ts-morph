// Checks the invariants the adapter exists to provide:
//   - getChildren returns identical node objects across calls (ts-morph keys its
//     wrapper cache on compiler-node identity, so this is correctness, not perf)
//   - getLastToken matches classic TypeScript, including zero-width tokens
//   - a SourceFile accepts fileName/version re-stamping
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/adapter-invariants.mts
import assert from "node:assert";
import { getChildren, getLastToken } from "../packages/common/src/tsgo/getChildren.ts";
import { setSourceFileProperty } from "../packages/common/src/tsgo/mutableSourceFile.ts";
import { SyntaxKind } from "../submodules/typescript-go/_packages/native-preview/src/ast/index.ts";
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

// 2. getLastToken returns the file's EndOfFileToken, which is zero-width when
//    the source has no trailing newline. Classic returns it; a "skip empty
//    children" rule would return the preceding semicolon instead.
const lastToken = getLastToken(sourceFile)!;
assert.ok(lastToken, "expected a last token");
assert.equal(lastToken.kind, SyntaxKind.EndOfFile, "last token of a source file is its EndOfFileToken");
assert.equal(lastToken.end, sourceFile.end, "last token must end where the file does");
console.log("last token:", SyntaxKind[lastToken.kind], `[${lastToken.pos},${lastToken.end})`);

// And on a non-SourceFile node it is the close brace, which is what
// Node#getLastToken's documentation describes.
const classDecl = (sourceFile as any).statements[0];
const classLast = getLastToken(classDecl, sourceFile)!;
assert.equal(classLast.kind, SyntaxKind.CloseBraceToken, "last token of a class declaration is its close brace");
assert.equal(classLast.end, classDecl.end);

// 3. A source file rejects plain fileName assignment; re-stamping shadows the
//    getter on the file itself, so node identity and memoization are unaffected.
assert.throws(() => {
  (sourceFile as any).fileName = "/src/renamed.ts";
}, "raw RemoteSourceFile should reject fileName assignment");

const statementsBefore = (sourceFile as any).statements;
const childrenBefore = getChildren(sourceFile);
setSourceFileProperty(sourceFile, "fileName", "/src/renamed.ts");
setSourceFileProperty(sourceFile, "version", "2");
assert.equal(sourceFile.fileName, "/src/renamed.ts");
assert.equal((sourceFile as any).version, "2");
assert.equal((sourceFile as any).statements, statementsBefore, "re-stamping must not disturb the tree");
assert.equal(getChildren(sourceFile), childrenBefore, "re-stamping must not invalidate synthesized children");
assert.equal(
  (sourceFile as any).statements[0].getSourceFile().fileName,
  "/src/renamed.ts",
  "nodes must see the new name, which a prototype view could not provide",
);
console.log("re-stamped fileName:", sourceFile.fileName);

api.close();
console.log("ADAPTER INVARIANTS OK");
