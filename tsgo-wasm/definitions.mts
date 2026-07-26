// Exercises getDefinition and getImplementations, routed from internal/ls
// through the API session and returned as offset-based spans.
//   node --experimental-strip-types --no-warnings --conditions @typescript/source tsgo-wasm/definitions.mts
import assert from "node:assert";
import { createInProcessApi } from "./seam.mts";

const files: Record<string, string> = {
  "/tsconfig.json": JSON.stringify({ compilerOptions: { strict: true } }),
  "/src/iface.ts": `export interface Shape {\n  area(): number;\n}\n`,
  "/src/impl.ts": `import { Shape } from "./iface";\n\nexport class Square implements Shape {\n  area() { return 1; }\n}\n`,
  "/src/use.ts": `import { Square } from "./impl";\n\nconst s = new Square();\nexport const a = s.area();\n`,
};

const api = createInProcessApi({ files });
const snapshot = api.updateSnapshot({ openProject: "/tsconfig.json" });
const project = snapshot.getProject("/tsconfig.json")!;

/** Renders a span as `file:"text"` so results are readable. */
function show(span: { fileName: string; pos: number; end: number }): string {
  return `${span.fileName}:${JSON.stringify(files[span.fileName]?.slice(span.pos, span.end) ?? "")}`;
}

// 1. Definition of `Square` at its use site resolves to the class declaration.
{
  const pos = files["/src/use.ts"].indexOf("Square()");
  const defs = project.getDefinition("/src/use.ts", pos);
  console.log("definition of Square:", defs.map(show).join(", "));
  assert.ok(defs.length > 0, "expected a definition");
  assert.equal(defs[0].fileName, "/src/impl.ts");
}

// 2. Definition of the `area` call resolves into the implementing class.
{
  const pos = files["/src/use.ts"].indexOf("area()");
  const defs = project.getDefinition("/src/use.ts", pos);
  console.log("definition of area:", defs.map(show).join(", "));
  assert.ok(defs.length > 0, "expected a definition for area");
}

// 3. Implementations of the interface member.
{
  const pos = files["/src/iface.ts"].indexOf("area()");
  const impls = project.getImplementations("/src/iface.ts", pos);
  console.log("implementations of Shape.area:", impls.map(show).join(", "));
  assert.ok(impls.length > 0, "expected an implementation");
  assert.ok(impls.some(i => i.fileName === "/src/impl.ts"), "implementation should be in impl.ts");
}

api.close();
console.log("DEFINITIONS OK");
