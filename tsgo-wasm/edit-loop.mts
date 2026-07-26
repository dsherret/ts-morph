// Exercises the edit -> reparse loop that ts-morph's manipulation engine needs:
// mutate a file in the in-memory FS, tell the session what changed, and confirm
// both the AST and the checker observe the new text. Also covers file creation
// and deletion. Run from the repo root:
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/edit-loop.mts
import assert from "node:assert";
import { createVirtualFileSystem } from "../submodules/typescript-go/_packages/native-preview/src/api/fs.ts";
import { createInProcessApi } from "./seam.mts";

const files: Record<string, string> = {
  "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
  "/src/index.ts": `export const x: number = 1;\n`,
};

// The virtual FS is mutable, so edits are applied by writing through it.
const fs = createVirtualFileSystem(files);
const api = createInProcessApi({ fs });

function typeOfX(): string {
  const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
  const project = snapshot.getProject("/tsconfig.json")!;
  const symbol = project.checker.getSymbolAtPosition("/src/index.ts", "export const ".length)!;
  return project.checker.typeToString(project.checker.getTypeOfSymbol(symbol)!);
}

function statementCount(): number {
  const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
  const project = snapshot.getProject("/tsconfig.json")!;
  return project.program.getSourceFile("/src/index.ts")!.statements.length;
}

// 1. Baseline.
assert.equal(typeOfX(), "number");
assert.equal(statementCount(), 1);
console.log("baseline: typeof x = number, statements = 1");

// 2. Edit the file's text, then report the change.
fs.writeFile!("/src/index.ts", `export const x: string = "hi";\nexport const second = 2;\n`);
api.updateSnapshot({ fileChanges: { changed: ["/src/index.ts"] } });
api.clearSourceFileCache();
assert.equal(typeOfX(), "string", "checker should observe the edited text");
assert.equal(statementCount(), 2, "AST should observe the edited text");
console.log("after edit: typeof x = string, statements = 2");

// 3. Create a new file and have it participate in the program.
fs.writeFile!("/src/other.ts", `export const other = 123;\n`);
api.updateSnapshot({ fileChanges: { created: ["/src/other.ts"] } });
{
  const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
  const project = snapshot.getProject("/tsconfig.json")!;
  const other = project.program.getSourceFile("/src/other.ts");
  assert.ok(other, "newly created file should be in the program");
  console.log("after create: /src/other.ts has", other.statements.length, "statement(s)");
}

// 4. Delete it again.
fs.removeFile!("/src/other.ts");
api.updateSnapshot({ fileChanges: { deleted: ["/src/other.ts"] } });
api.clearSourceFileCache();
{
  const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
  const project = snapshot.getProject("/tsconfig.json")!;
  const names = project.program.getSourceFileNames();
  assert.ok(!names.includes("/src/other.ts"), "deleted file should leave the program");
  console.log("after delete: /src/other.ts removed from program");
}

api.close();
console.log("EDIT LOOP OK");
