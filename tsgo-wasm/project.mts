// End-to-end check of the ts-morph package itself, running against the tsgo
// backend. Every other script in this folder exercises packages/common/src/tsgo
// directly; this one drives the public `Project` API, which is the only way to
// cover the ~70 migrated files under packages/ts-morph/src.
//
// ts-morph's sources use extensionless relative imports, so Node cannot load
// them directly the way the other scripts load the adapter. It therefore runs
// against the rollup bundles, rebuilding them first when they are out of date.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/project.mts
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
buildIfStale("packages/common", "packages/common/dist/ts-morph-common.js", ["packages/common/src"]);
buildIfStale("packages/ts-morph", "packages/ts-morph/dist/ts-morph.js", ["packages/ts-morph/src"]);

const { Project, SyntaxKind } = createRequire(import.meta.url)(path.join(rootDir, "packages/ts-morph/dist/ts-morph.js"));

// 1. A project reads its files through the tsgo-backed document registry.
// tsgo reports TS5011 when outDir is set without an explicit rootDir, so set both.
const project = new Project({ useInMemoryFileSystem: true, compilerOptions: { strict: true, rootDir: "/src", outDir: "/out" } });
const sourceFile = project.createSourceFile(
  "/src/greeter.ts",
  "export class Greeter {\n  greet( name:string ){ return `hi ${name}`; }\n}\nconst g = new Greeter();\ng.greet(\"world\");\n",
);
assert.equal(sourceFile.getKindName(), "SourceFile");
assert.deepEqual(project.getSourceFiles().map((f: any) => f.getFilePath()), ["/src/greeter.ts"]);

// 2. Wrappers are reachable and cached by compiler-node identity.
const greeter = sourceFile.getClassOrThrow("Greeter");
assert.equal(greeter, sourceFile.getClassOrThrow("Greeter"), "wrappers should be cached");
assert.deepEqual(greeter.getMembers().map((m: any) => m.getKindName()), ["MethodDeclaration"]);
const greet = greeter.getMethodOrThrow("greet");
assert.deepEqual(greet.getParameters().map((p: any) => p.getName()), ["name"]);
assert.equal(greet.getFirstDescendantByKindOrThrow(SyntaxKind.TemplateExpression).getKindName(), "TemplateExpression");

// 3. The checker answers through tsgo.
assert.equal(greet.getReturnType().getText(), "string");
assert.equal(greet.getParameters()[0].getType().getText(), "string");
assert.deepEqual(project.getPreEmitDiagnostics(), []);

// 4. Manipulation rewrites the text and re-parses.
sourceFile.addInterface({ name: "Named", properties: [{ name: "name", type: "string" }] });
assert.equal(sourceFile.getInterfaceOrThrow("Named").getPropertyOrThrow("name").getType().getText(), "string");
assert.equal(sourceFile.getClassOrThrow("Greeter").getMethodOrThrow("greet").getName(), "greet", "old wrappers should be reusable after a manipulation");

// 5. Rename goes through the language service and updates every reference.
greeter.rename("Salutation");
assert.ok(sourceFile.getFullText().includes("new Salutation()"), "rename should update the reference");
assert.equal(sourceFile.getClass("Greeter"), undefined);

// 6. Formatting goes through the language service.
sourceFile.formatText();
assert.ok(sourceFile.getFullText().includes("greet(name: string)"), `formatting should normalize spacing, got: ${sourceFile.getFullText()}`);

// 7. Emit produces JavaScript for the project's outDir.
const emitted = project.emitToMemory().getFiles();
assert.deepEqual(emitted.map((f: any) => f.filePath), ["/out/greeter.js"]);
assert.ok(!emitted[0].text.includes(": string"), "emitted JavaScript should have no type annotations");

// 8. A type error is reported with the expected code.
project.createSourceFile("/src/bad.ts", "export const x: number = \"nope\";\n");
assert.deepEqual(project.getPreEmitDiagnostics().map((d: any) => d.getCode()), [2322]);

console.log("project OK");

/** Rebuilds a package's rollup bundle when it is older than the sources it is built from. */
function buildIfStale(packageDir: string, bundlePath: string, sourceDirs: string[]) {
  const bundleTime = mtimeOrZero(path.join(rootDir, bundlePath));
  const newestSource = Math.max(...sourceDirs.map(dir => newestMtime(path.join(rootDir, dir))));
  if (bundleTime > newestSource)
    return;
  execFileSync("npx", ["rollup", "--config"], { cwd: path.join(rootDir, packageDir), stdio: "ignore", shell: true });
}

function newestMtime(dir: string): number {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    newest = Math.max(newest, entry.isDirectory() ? newestMtime(entryPath) : statSync(entryPath).mtimeMs);
  }
  return newest;
}

function mtimeOrZero(filePath: string): number {
  try {
    return statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}
