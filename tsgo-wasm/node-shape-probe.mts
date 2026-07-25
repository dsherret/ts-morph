// Probes assumptions ts-morph makes about compiler nodes being plain, mutable
// JS objects, against tsgo's lazy DataView-backed RemoteSourceFile/RemoteNode:
//
//   - createDocumentCache.ts deepClones a whole SourceFile, then assigns fileName
//   - DocumentRegistry.ts stamps a `version` onto the SourceFile
//   - CompilerComments.ts splices foreign node objects into child arrays
//
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/node-shape-probe.mts
import { createInProcessApi } from "./seam.mts";

const api = createInProcessApi({
  files: {
    "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
    "/src/index.ts": `export const x: number = 1;\n`,
  },
});

const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;
const sourceFile: any = project.program.getSourceFile("/src/index.ts")!;
const firstStatement: any = sourceFile.statements[0];

function probe(label: string, fn: () => unknown): void {
  try {
    console.log(`  ${label}: ok ->`, fn());
  } catch (err) {
    console.log(`  ${label}: THROWS -> ${(err as Error).message.split("\n")[0]}`);
  }
}

console.log("constructor:", sourceFile.constructor?.name, "| node:", firstStatement.constructor?.name);

console.log("\nown enumerable keys (what deepClone would copy):");
console.log("  sourceFile:", JSON.stringify(Object.keys(sourceFile)));
console.log("  statement :", JSON.stringify(Object.keys(firstStatement)));

console.log("\nmutability:");
probe("assign sourceFile.fileName", () => {
  sourceFile.fileName = "/src/renamed.ts";
  return sourceFile.fileName;
});
probe("stamp sourceFile.version", () => {
  sourceFile.version = "1";
  return sourceFile.version;
});
probe("assign node.parent", () => {
  const original = firstStatement.parent;
  firstStatement.parent = sourceFile;
  const ok = firstStatement.parent === sourceFile;
  firstStatement.parent = original;
  return ok;
});

console.log("\ndeepClone-style copy (Object.create(proto) + copy own keys):");
probe("clone sourceFile then read .statements", () => {
  const clone: any = Object.create(Object.getPrototypeOf(sourceFile));
  for (const key of Object.keys(sourceFile)) clone[key] = sourceFile[key];
  return `statements=${clone.statements?.length}`;
});

console.log("\nproperty descriptors (getter vs data property):");
for (const name of ["fileName", "text", "statements"]) {
  let proto = sourceFile;
  let desc: PropertyDescriptor | undefined;
  while (proto && !desc) {
    desc = Object.getOwnPropertyDescriptor(proto, name);
    proto = Object.getPrototypeOf(proto);
  }
  console.log(`  ${name}: ${desc ? (desc.get ? "getter" + (desc.set ? "+setter" : " (no setter)") : "data") : "absent"}`);
}

console.log("\nbinder internals ts-morph reads via `as any`:");
for (const key of ["symbol", "locals", "imports", "scriptKind", "emitNode", "modifiers"]) {
  const present = key in sourceFile || key in firstStatement;
  console.log(`  ${key}: ${present ? "present" : "ABSENT"}`);
}

api.close();
