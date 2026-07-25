// Verifies that getChildren() over the tsgo AST matches classic TypeScript's
// Node#getChildren() exactly: same kinds, same spans, same order, whole tree.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/getChildren-parity.mts
import assert from "node:assert";
import ts from "typescript";
import { formatSyntaxKind } from "../submodules/typescript-go/_packages/native-preview/src/ast/utils.ts";
import { createInProcessApi } from "./seam.mts";
import { getChildren, getSyntaxListChildren } from "./getChildren.mts";

const text = `import { foo } from "./foo";

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

const api = createInProcessApi({
  files: {
    "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true, target: "esnext" } }),
    "/src/index.ts": text,
  },
});

const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;
const goFile = project.program.getSourceFile("/src/index.ts")!;

const tsFile = ts.createSourceFile("/src/index.ts", text, ts.ScriptTarget.ESNext, /*setParentNodes*/ true);

// The two ASTs number and name their kinds independently (and classic TS
// reverse-maps aliases like FirstStatement), so comparing names directly is
// noise. Instead compare spans exactly and require the kind correspondence to be
// a consistent bijection across the whole tree.
function tsKindName(kind: ts.SyntaxKind): string {
  for (const [name, value] of Object.entries(ts.SyntaxKind)) {
    if (value === kind && !/^(First|Last)/.test(name)) return name;
  }
  return String(kind);
}
function span(n: { pos: number; end: number }): string {
  return `[${n.pos},${n.end})`;
}

let compared = 0;
const mismatches: string[] = [];
const goToTs = new Map<number, string>();
const tsToGo = new Map<string, number>();

function recordKindMapping(goKind: number, tsKind: ts.SyntaxKind, path: string): void {
  const tsName = tsKindName(tsKind);
  const seenTs = goToTs.get(goKind);
  if (seenTs === undefined) goToTs.set(goKind, tsName);
  else if (seenTs !== tsName) {
    mismatches.push(`at ${path}: tsgo kind ${formatSyntaxKind(goKind)} maps to both ${seenTs} and ${tsName}`);
  }
  const seenGo = tsToGo.get(tsName);
  if (seenGo === undefined) tsToGo.set(tsName, goKind);
  else if (seenGo !== goKind) {
    mismatches.push(
      `at ${path}: classic ${tsName} maps to both ${formatSyntaxKind(seenGo)} and ${formatSyntaxKind(goKind)}`,
    );
  }
}

function walk(goNode: any, tsNode: ts.Node, path: string): void {
  const goKids: any[] = goNode._children ? getSyntaxListChildren(goNode) : getChildren(goNode, goFile);
  const tsKids = tsNode.getChildren(tsFile);

  compared++;
  const goSig = goKids.map(span).join(" ");
  const tsSig = tsKids.map(span).join(" ");
  if (goSig !== tsSig) {
    mismatches.push(
      `at ${path}\n  tsgo:    ${goKids.map(k => formatSyntaxKind(k.kind) + span(k)).join(" ")}\n  classic: ${
        tsKids.map(k => tsKindName(k.kind) + span(k)).join(" ")
      }`,
    );
    return; // don't recurse into a subtree that already diverged
  }
  for (let i = 0; i < tsKids.length; i++) {
    recordKindMapping(goKids[i].kind, tsKids[i].kind, path);
    walk(goKids[i], tsKids[i], `${path} > ${tsKindName(tsKids[i].kind)}`);
  }
}

walk(goFile, tsFile, "SourceFile");

console.log(`compared ${compared} nodes, ${goToTs.size} distinct kinds mapped 1:1`);
if (mismatches.length) {
  console.log(`MISMATCHES: ${mismatches.length}`);
  for (const m of mismatches.slice(0, 10)) console.log(m);
} else {
  console.log("getChildren parity: exact match with classic TypeScript");
}

api.close();
assert.equal(mismatches.length, 0, "expected exact getChildren parity");
console.log("GETCHILDREN PARITY OK");
