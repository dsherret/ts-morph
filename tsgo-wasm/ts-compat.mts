// Sanity check for the tsgo-backed `ts` namespace: the enums, guards, and
// scanner utilities ts-morph reaches for are present and behave as expected.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/ts-compat.mts
import assert from "node:assert";
import * as ts from "../packages/common/src/tsgo/ts.ts";

console.log("SyntaxKind.ClassDeclaration =", ts.SyntaxKind.ClassDeclaration);
console.log("reverse map =", ts.SyntaxKind[ts.SyntaxKind.ClassDeclaration]);
assert.equal(ts.SyntaxKind[ts.SyntaxKind.ClassDeclaration], "ClassDeclaration");

// getSyntaxKindName reflects over the enum object, so it must be reverse-mappable.
const names = Object.keys(ts.SyntaxKind).filter(k => isNaN(Number(k)));
console.log("SyntaxKind names =", names.length);
assert.ok(names.length > 100);

for (const fn of ["isClassDeclaration", "skipTrivia", "getChildren", "getLastToken", "createScanner", "forEachChild"] as const) {
  assert.equal(typeof (ts as any)[fn], "function", `${fn} should be a function`);
}
assert.equal(ts.escapeLeadingUnderscores("__x"), "___x");
// ESNext shares its value with the Latest alias, so check the value round-trips.
assert.equal(ts.ScriptTarget[ts.ScriptTarget.ESNext as number] !== undefined, true);
console.log("enums, guards, scanner utilities all present");

console.log("TS COMPAT OK");
