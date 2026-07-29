// The browser acceptance test: the real ts-morph, in a real Web Worker, with no
// Node built-ins anywhere in the module graph.
//
// A worker rather than the main thread because V8 refuses both
// `new WebAssembly.Module` and `new WebAssembly.Instance` above 8 MB there, and
// ts-morph's API is synchronous throughout — off the main thread the synchronous
// path is allowed, so the library needs no async redesign.
//
// Bundled and run by ./run.mjs.
import { initializeWasm, Project } from "ts-morph";

const lines: string[] = [];

function log(line: string) {
  lines.push(line);
}

async function main() {
  const start = performance.now();

  await assertServedRaw();

  // No argument, so this is the documented default: fetch `typescript.wasm` from
  // beside the bundle and compile it once. Everything after it is synchronous.
  const fetched = performance.now();
  await initializeWasm();
  log(`initializeWasm: ${(performance.now() - fetched).toFixed(0)}ms`);

  const created = performance.now();
  const project = new Project({ useInMemoryFileSystem: true });
  log(`new Project(): ${(performance.now() - created).toFixed(0)}ms`);

  const file = project.createSourceFile(
    "/src/main.ts",
    [
      "interface Point { x: number; y: number; }",
      "export function dist(a: Point, b: Point): number {",
      "  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);",
      "}",
      "export const bad: string = 123;",
    ].join("\n"),
  );

  const dist = file.getFunctionOrThrow("dist");
  assert(dist.getName() === "dist", "expected to find the dist function");
  const parameters = dist.getParameters().map(p => `${p.getName()}: ${p.getType().getText()}`).join(", ");
  assert(parameters === "a: Point, b: Point", `unexpected parameters: ${parameters}`);
  assert(dist.getReturnType().getText() === "number", "expected dist to return number");
  log(`checker: dist(${parameters}): ${dist.getReturnType().getText()}`);

  const diagnostics = project.getPreEmitDiagnostics();
  assert(diagnostics.length === 1, `expected the one seeded error, got ${diagnostics.length}`);
  assert(diagnostics[0].getCode() === 2322, `expected TS2322, got TS${diagnostics[0].getCode()}`);
  log(`diagnostics: TS${diagnostics[0].getCode()}`);

  // manipulation, and a re-check that sees it
  file.addFunction({ name: "sum", parameters: [{ name: "n", type: "number[]" }], statements: "return n.reduce((a, b) => a + b, 0);" });
  assert(file.getFunctionOrThrow("sum").getReturnType().getText() === "number", "expected sum to return number");
  assert(file.getEmitOutput().getOutputFiles().length > 0, "expected emit output");
  log("manipulate, re-check and emit: ok");

  // a second pass, so this is not a one-shot
  const batch = performance.now();
  for (let i = 0; i < 50; i++)
    project.createSourceFile(`/src/g${i}.ts`, `export interface G${i} { a: number; }\nexport const g${i}: G${i} = { a: ${i} };`);
  assert(project.getPreEmitDiagnostics().length === 1, "expected the 50 added files to be clean");
  log(`50 more files + recheck: ${(performance.now() - batch).toFixed(0)}ms`);

  log(`total: ${(performance.now() - start).toFixed(0)}ms`);
}

/**
 * That what arrives over the wire is the module itself, and says how much of it
 * a page has to download.
 *
 * Only the first chunk is read, for the WebAssembly magic word; the rest of the
 * body is dropped.
 */
async function assertServedRaw() {
  const response = await fetch("/typescript.wasm");
  const reader = response.body!.getReader();
  const { value } = await reader.read();
  void reader.cancel();
  assert(
    value?.[0] === 0x00 && value?.[1] === 0x61 && value?.[2] === 0x73 && value?.[3] === 0x6d,
    `expected the WebAssembly magic word, got ${value?.[0]} ${value?.[1]} ${value?.[2]} ${value?.[3]}`,
  );
  log(`typescript.wasm: ${response.headers.get("content-length")} bytes`);
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition)
    throw new Error(message);
}

main().then(
  () => report("OK"),
  (error: unknown) => {
    log(String((error as Error)?.stack ?? error));
    report("FAILED");
  },
);

function report(result: string) {
  log(`RESULT: ${result}`);
  for (const line of lines)
    console.log(line);
  // The driver watches for this rather than scraping the page: a worker has no
  // DOM, and the result has to survive whatever the browser does next.
  void fetch("/result", { method: "POST", body: JSON.stringify({ result, lines }) });
}
