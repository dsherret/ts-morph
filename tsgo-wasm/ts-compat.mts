// Sanity check for the tsgo-backed `ts` namespace: the enums, guards, and
// scanner utilities ts-morph reaches for are present and behave as expected.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/ts-compat.mts
import assert from "node:assert";
import { getChildren, getLastToken } from "../packages/common/src/tsgo/getChildren.ts";
import * as ts from "../packages/common/src/tsgo/ts.ts";

console.log("SyntaxKind.ClassDeclaration =", ts.SyntaxKind.ClassDeclaration);
console.log("reverse map =", ts.SyntaxKind[ts.SyntaxKind.ClassDeclaration]);
assert.equal(ts.SyntaxKind[ts.SyntaxKind.ClassDeclaration], "ClassDeclaration");

// getSyntaxKindName reflects over the enum object, so it must be reverse-mappable.
const names = Object.keys(ts.SyntaxKind).filter(k => isNaN(Number(k)));
console.log("SyntaxKind names =", names.length);
assert.ok(names.length > 100);

// The scanner utilities are load-bearing: getChildren drives createScanner to
// rebuild the tokens tsgo does not store, so a wrong implementation must fail
// here rather than pass a typeof check.
assert.equal(ts.skipTrivia("  /*c*/x", 0), 7, "skipTrivia should skip whitespace and comments");
assert.equal(ts.skipTrivia("x", 0), 0, "skipTrivia should not move past real text");

const scanner = ts.createScanner(/* skipTrivia */ true, ts.LanguageVariant.Standard, "  const x = 1;");
const scanned: string[] = [];
scanner.resetTokenState(0);
for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFile; kind = scanner.scan())
  scanned.push(`${ts.SyntaxKind[kind]}[${scanner.getTokenStart()},${scanner.getTokenEnd()})`);
console.log("scanned:", scanned.join(" "));
assert.deepEqual(
  scanned,
  // The reverse map yields whichever name the enum declares first, so the
  // EqualsToken and NumericLiteral kinds come back under their range aliases.
  ["ConstKeyword[2,7)", "Identifier[8,9)", "FirstAssignment[10,11)", "FirstLiteralToken[12,13)", "SemicolonToken[13,14)"],
  "the scanner should produce the expected tokens and spans",
);

assert.equal(ts.tokenToString(ts.SyntaxKind.ConstKeyword), "const");

// The guards discriminate on kind, so a bare kind is enough to exercise them.
assert.equal(ts.isClassDeclaration({ kind: ts.SyntaxKind.ClassDeclaration } as never), true);
assert.equal(ts.isClassDeclaration({ kind: ts.SyntaxKind.InterfaceDeclaration } as never), false);
// forEachChild delegates to the node, so it needs a real tree; getChildren-parity
// covers it over the whole grammar.
assert.equal(typeof ts.forEachChild, "function");
assert.equal(typeof getChildren, "function");
assert.equal(typeof getLastToken, "function");
assert.equal(ts.escapeLeadingUnderscores("__x"), "___x");
assert.equal(ts.unescapeLeadingUnderscores("___x" as never), "__x");
console.log("enums, guards, scanner utilities all behave");

console.log("TS COMPAT OK");
