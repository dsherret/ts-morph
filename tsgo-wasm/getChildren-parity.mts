// Verifies that getChildren() over the tsgo AST matches classic TypeScript's
// Node#getChildren() exactly: same kinds, same spans, same order, same token
// parents, whole tree.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/getChildren-parity.mts
//
// `typescript` must stay a devDependency of packages/common for this script:
// it is the reference implementation the adapter is compared against, and there
// is no other guard on getChildren's output.
import assert from "node:assert";
import ts from "typescript";
import { formatSyntaxKind } from "../submodules/typescript-go/_packages/native-preview/src/ast/utils.ts";
import { getChildren, getLastToken } from "./getChildren.mts";
import { createInProcessApi } from "./seam.mts";

// Grammar breadth: declarations, generics, control flow, destructuring, mapped
// and union types, enums.
const tsText = `import { foo } from "./foo";

export const x: number = 1;

export class C<T> extends Base implements I {
  private readonly value: T[] = [];
  constructor(public a: string, b?: number) { super(); }
  method(...args: string[]): void {
    for (let i = 0; i < 10; i++) { console.log(i, this.value); }
    if (a) { return; } else { throw new Error(\`bad \${a}\`); }
  }
}

export default function f<U extends object = {}>(o: U | null): U | undefined {
  const { p = 1, ...rest } = o as any;
  return o ?? undefined;
}

type A = { [K in keyof C]?: C[K] } & (string | number);
enum E { A = 1, B }
`;

// Trivia: doc comments (which forEachChild skips and the scanner must never be
// run over), plus leading, trailing and inline line/block comments. These are
// the shapes ExtendedParser and CommentNodeParser are built on.
const triviaText = `/**
 * A documented class.
 * @param a the a
 * @returns nothing
 */
export class Documented {
  /** A documented member. */
  value = 1; // trailing line comment

  /* leading block */ method(/* inline */ a: string, b /* after */: number): void {}
}

// A leading line comment.
/** A documented function. */
export function documented(): void {
  // an interior comment
}

/** @deprecated use something else */
export const deprecated = 1;
`;

// JSX: a different language variant, so the scanner is configured differently.
const tsxText = `import * as React from "react";

export const App = (props: { name: string }) => (
  <div className="root" data-x={1}>
    {/* a jsx comment */}
    <span>{props.name}</span>
    <Self.Closing {...props} />
    <>fragment {props.name}</>
  </div>
);
`;

const files = {
  "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true, target: "esnext", jsx: "preserve" } }),
  "/src/index.ts": tsText,
  "/src/trivia.ts": triviaText,
  "/src/app.tsx": tsxText,
};

const api = createInProcessApi({ files });
const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;

// The two ASTs number and name their kinds independently (and classic TS
// reverse-maps aliases like FirstStatement), so comparing names directly is
// noise. Instead compare spans exactly and require the kind correspondence to be
// a consistent bijection across the whole tree.
function tsKindName(kind: ts.SyntaxKind): string {
  for (const [name, value] of Object.entries(ts.SyntaxKind))
    if (value === kind && !/^(First|Last)/.test(name)) return name;
  return String(kind);
}
function span(n: { pos: number; end: number }): string {
  return `[${n.pos},${n.end})`;
}

let compared = 0;
const mismatches: string[] = [];
const divergences: string[] = [];
const goToTs = new Map<number, string>();
const tsToGo = new Map<string, number>();

/**
 * The one difference that comes from tsgo's AST rather than from getChildren, so
 * no amount of token synthesis can remove it: tsgo stores doc comment prose as
 * `JSDocText` children, both on the `JSDoc` node and on its tags, where classic
 * keeps plain prose as a string on the `comment` property and so has no child at
 * all. It is reported separately and does not fail the run; anything else does.
 *
 * Only this node's child list is affected, so the aligned children are returned
 * and the walk keeps comparing everything below them.
 */
function alignKnownAstDivergence(goKids: any[], tsKids: readonly ts.Node[]): { goKids: any[]; tsKids: readonly ts.Node[] } | undefined {
  // JSDocText children that classic does not model as nodes at all.
  const withoutText = goKids.filter(k => k.kind !== 316 /* JSDocText */);
  if (withoutText.length < goKids.length && withoutText.map(span).join(" ") === tsKids.map(span).join(" "))
    return { goKids: withoutText, tsKids };
  return undefined;
}

function recordKindMapping(goKind: number, tsKind: ts.SyntaxKind, path: string): void {
  const tsName = tsKindName(tsKind);
  const seenTs = goToTs.get(goKind);
  if (seenTs === undefined) goToTs.set(goKind, tsName);
  else if (seenTs !== tsName)
    mismatches.push(`at ${path}: tsgo kind ${formatSyntaxKind(goKind)} maps to both ${seenTs} and ${tsName}`);
  const seenGo = tsToGo.get(tsName);
  if (seenGo === undefined) tsToGo.set(tsName, goKind);
  else if (seenGo !== goKind) {
    mismatches.push(
      `at ${path}: classic ${tsName} maps to both ${formatSyntaxKind(seenGo)} and ${formatSyntaxKind(goKind)}`,
    );
  }
}

function compareFile(fileName: string, text: string, scriptKind: ts.ScriptKind): void {
  const goFile = project.program.getSourceFile(fileName)!;
  const tsFile = ts.createSourceFile(
    fileName,
    text,
    {
      languageVersion: ts.ScriptTarget.ESNext,
      jsDocParsingMode: ts.JSDocParsingMode.ParseAll,
    },
    /*setParentNodes*/ true,
    scriptKind,
  );

  function walk(goNode: any, tsNode: ts.Node, path: string): void {
    let goKids: any[] = getChildren(goNode, goFile);
    let tsKids: readonly ts.Node[] = tsNode.getChildren(tsFile);

    compared++;
    const goSig = goKids.map(span).join(" ");
    const tsSig = tsKids.map(span).join(" ");
    if (goSig !== tsSig) {
      const report = `at ${fileName} ${path}\n  tsgo:    ${goKids.map(k => formatSyntaxKind(k.kind) + span(k)).join(" ")}\n  classic: ${
        tsKids.map(k => tsKindName(k.kind) + span(k)).join(" ")
      }`;
      const aligned = alignKnownAstDivergence(goKids, tsKids);
      if (aligned == null) {
        mismatches.push(report);
        return; // don't recurse into a subtree that really disagrees
      }
      // A known divergence only affects this node's child list, so record it and
      // keep comparing everything below the children that do correspond.
      divergences.push(report);
      goKids = aligned.goKids;
      tsKids = aligned.tsKids;
    }
    for (let i = 0; i < tsKids.length; i++) {
      recordKindMapping(goKids[i].kind, tsKids[i].kind, path);
      // A synthesized token's parent must be the node classic parents it to.
      // getParentSyntaxList relies on separators inside a list being parented to
      // the node above the list, not to the list itself.
      const goKid = goKids[i], tsKid = tsKids[i];
      if (tsKid.kind <= ts.SyntaxKind.LastToken && goKid.parent != null && tsKid.parent != null) {
        const goParent = formatSyntaxKind(goKid.parent.kind);
        const tsParent = tsKindName(tsKid.parent.kind);
        const mapped = goToTs.get(goKid.parent.kind);
        if (mapped !== undefined && mapped !== tsParent) {
          mismatches.push(
            `at ${fileName} ${path}: token ${span(goKid)} parent is ${goParent} (${mapped}), classic says ${tsParent}`,
          );
        }
      }
      walk(goKid, tsKid, `${path} > ${tsKindName(tsKid.kind)}`);
    }
  }

  walk(goFile, tsFile, "SourceFile");

  // getLastToken must agree too, including on zero-width EndOfFileToken.
  const goLast = getLastToken(goFile, goFile)!;
  const tsLast = tsFile.getLastToken(tsFile);
  assert.ok(goLast, `${fileName}: expected a last token`);
  assert.equal(
    span(goLast),
    tsLast === undefined ? "undefined" : span(tsLast),
    `${fileName}: getLastToken span should match classic`,
  );
}

compareFile("/src/index.ts", tsText, ts.ScriptKind.TS);
compareFile("/src/trivia.ts", triviaText, ts.ScriptKind.TS);
compareFile("/src/app.tsx", tsxText, ts.ScriptKind.TSX);

console.log(`compared ${compared} nodes, ${goToTs.size} distinct kinds mapped 1:1`);
console.log(`known tsgo AST divergences (JSDocText nodes): ${divergences.length}`);
if (mismatches.length) {
  console.log(`MISMATCHES: ${mismatches.length}`);
  for (const m of mismatches.slice(0, 10)) console.log(m);
} else {
  console.log("getChildren parity: matches classic TypeScript apart from the known AST divergences");
}

api.close();
assert.equal(mismatches.length, 0, "expected exact getChildren parity");
console.log("GETCHILDREN PARITY OK");
