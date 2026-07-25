// Proof that ts-morph's repo can drive tsgo in-process via WebAssembly through
// the seam. Run from the repo root:
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/proof.mts
import assert from "node:assert";
import { SyntaxKind } from "../submodules/typescript-go/_packages/native-preview/src/ast/index.ts";
import { createInProcessApi } from "./seam.mts";

const api = createInProcessApi({
    files: {
        "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
        "/src/index.ts": `export const x: number = 1;\nexport const y = x + 2;\nexport function add(a: number, b: number) { return a + b; }\n`,
    },
});

const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;
const sourceFile = project.program.getSourceFile("/src/index.ts")!;

let identifiers = 0;
sourceFile.forEachChild(function visit(node) {
    if (node.kind === SyntaxKind.Identifier) identifiers++;
    node.forEachChild(visit);
});

const xSymbol = project.checker.getSymbolAtPosition("/src/index.ts", "export const ".length)!;
const xType = project.checker.getTypeOfSymbol(xSymbol)!;
const typeText = project.checker.typeToString(xType);
const diagnostics = project.program.getSemanticDiagnostics("/src/index.ts");

console.log("ts-morph → tsgo-wasm:", {
    statements: sourceFile.statements.length,
    identifiers,
    symbol: xSymbol.name,
    typeofX: typeText,
    semanticDiagnostics: diagnostics.length,
});

assert.equal(typeText, "number");
assert.equal(diagnostics.length, 0);

api.close();
console.log("TS-MORPH WASM SEAM OK");
