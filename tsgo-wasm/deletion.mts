// A project built with files removed as it goes has to answer exactly as one opened
// with the files it ends up holding. The removal path in the compiler extends the
// program rather than building it again wherever it can, and every way that could stop
// being the same program is a fallback — this drives the ones a caller can actually
// reach through ts-morph and compares the two projects on everything the API can be
// asked: which files it holds and in what order, what every import resolves to, and
// every diagnostic.
import { Project } from "../packages/ts-morph/dist/ts-morph.js";

type Files = Record<string, string>;

interface Case {
  name: string;
  files: Files;
  // run makes the removals (and whatever else) against a project holding files
  run: (project: Project) => void;
  // expected are the files the project should be left holding
  expected: Files;
  // fsOnly are files that are on the file system without being in the project, which
  // is what a file the caller stopped tracking but did not delete becomes
  fsOnly?: Files;
}

const cases: Case[] = [
  {
    name: "a file nothing refers to",
    files: { "/p/a.ts": "export const a = 1;", "/p/b.ts": "export const b = 2;" },
    run: p => p.removeSourceFile(p.getSourceFileOrThrow("/p/b.ts")),
    expected: { "/p/a.ts": "export const a = 1;" },
  },
  {
    name: "a file another one imports",
    files: {
      "/p/a.ts": `import { dep } from "./dep"; export const a = dep;`,
      "/p/dep.ts": "export const dep = 3;",
    },
    run: p => p.removeSourceFile(p.getSourceFileOrThrow("/p/dep.ts")),
    expected: { "/p/a.ts": `import { dep } from "./dep"; export const a = dep;` },
  },
  {
    name: "a declaration file beside the implementation",
    files: {
      "/p/a.ts": `import { s } from "./s"; export const a = s;`,
      "/p/s.ts": "export const s = 1;",
      "/p/s.d.ts": "export declare const s: string;",
    },
    run: p => p.removeSourceFile(p.getSourceFileOrThrow("/p/s.d.ts")),
    expected: {
      "/p/a.ts": `import { s } from "./s"; export const a = s;`,
      "/p/s.ts": "export const s = 1;",
    },
  },
  {
    name: "the implementation beside the declaration file",
    files: {
      "/p/a.ts": `import { s } from "./s"; export const a = s;`,
      "/p/s.ts": "export const s = 1;",
      "/p/s.d.ts": "export declare const s: string;",
    },
    run: p => p.removeSourceFile(p.getSourceFileOrThrow("/p/s.ts")),
    expected: {
      "/p/a.ts": `import { s } from "./s"; export const a = s;`,
      "/p/s.d.ts": "export declare const s: string;",
    },
  },
  {
    name: "a file a node_modules copy is waiting behind",
    files: {
      "/p/a.ts": `import { pkg } from "pkg"; export const a = pkg;`,
      "/p/node_modules/pkg/package.json": `{"name":"pkg","version":"1.0.0","types":"index.d.ts"}`,
      "/p/node_modules/pkg/index.d.ts": "export declare const pkg: number;",
      "/p/other.ts": "export const other = 1;",
    },
    run: p => p.removeSourceFile(p.getSourceFileOrThrow("/p/other.ts")),
    expected: {
      "/p/a.ts": `import { pkg } from "pkg"; export const a = pkg;`,
      "/p/node_modules/pkg/package.json": `{"name":"pkg","version":"1.0.0","types":"index.d.ts"}`,
      "/p/node_modules/pkg/index.d.ts": "export declare const pkg: number;",
    },
  },
  {
    name: "a file removed and written again at the same path",
    files: { "/p/a.ts": "export const a = 1;", "/p/b.ts": "export const b = 2;" },
    run: p => {
      p.removeSourceFile(p.getSourceFileOrThrow("/p/b.ts"));
      p.createSourceFile("/p/b.ts", "export const b = 22;");
    },
    expected: { "/p/a.ts": "export const a = 1;", "/p/b.ts": "export const b = 22;" },
  },
  {
    name: "a file removed while another is created",
    files: { "/p/a.ts": "export const a = 1;", "/p/b.ts": "export const b = 2;" },
    run: p => {
      p.createSourceFile("/p/c.ts", "export const c = 3;");
      p.removeSourceFile(p.getSourceFileOrThrow("/p/a.ts"));
    },
    expected: { "/p/b.ts": "export const b = 2;", "/p/c.ts": "export const c = 3;" },
  },
  {
    name: "a file removed while a file that imports it is created",
    files: { "/p/a.ts": "export const a = 1;", "/p/dep.ts": "export const dep = 3;" },
    run: p => {
      p.createSourceFile("/p/c.ts", `import { dep } from "./dep"; export const c = dep;`);
      p.removeSourceFile(p.getSourceFileOrThrow("/p/dep.ts"));
    },
    expected: {
      "/p/a.ts": "export const a = 1;",
      "/p/c.ts": `import { dep } from "./dep"; export const c = dep;`,
    },
  },
  {
    name: "a file removed while another is edited",
    files: { "/p/a.ts": "export const a = 1;", "/p/b.ts": "export const b = 2;" },
    run: p => {
      p.getSourceFileOrThrow("/p/a.ts").addClass({ name: "A" });
      p.removeSourceFile(p.getSourceFileOrThrow("/p/b.ts"));
    },
    expected: { "/p/a.ts": "export const a = 1;\n\nclass A {\n}\n" },
  },
  {
    name: "a file removed with forget rather than removeSourceFile",
    files: { "/p/a.ts": "export const a = 1;", "/p/b.ts": "export const b = 2;" },
    run: p => p.getSourceFileOrThrow("/p/b.ts").forget(),
    expected: { "/p/a.ts": "export const a = 1;" },
  },
  {
    name: "several files removed at once",
    files: {
      "/p/a.ts": "export const a = 1;",
      "/p/b.ts": "export const b = 2;",
      "/p/c.ts": "export const c = 3;",
      "/p/d.ts": "export const d = 4;",
    },
    run: p => {
      for (const name of ["/p/a.ts", "/p/c.ts"]) p.removeSourceFile(p.getSourceFileOrThrow(name));
    },
    expected: { "/p/b.ts": "export const b = 2;", "/p/d.ts": "export const d = 4;" },
  },
  {
    name: "more files removed than the compiler tracks at once",
    files: Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [`/p/f${i}.ts`, `export const f${i} = ${i};`]),
    ),
    run: p => {
      for (let i = 0; i < 11; i++) p.removeSourceFile(p.getSourceFileOrThrow(`/p/f${i}.ts`));
    },
    expected: { "/p/f11.ts": "export const f11 = 11;" },
  },
  {
    name: "a file in a directory of its own, which moves the common directory",
    files: { "/p/src/a.ts": "export const a = 1;", "/p/other/b.ts": "export const b = 2;" },
    run: p => p.removeSourceFile(p.getSourceFileOrThrow("/p/other/b.ts")),
    expected: { "/p/src/a.ts": "export const a = 1;" },
  },
  {
    // the registry's copy goes but the file system's stays, so an import created in
    // the same breath reaches the file that is leaving — the one case the walk cannot
    // reason about and gives the whole program up for
    name: "a file left on the file system while a file that imports it is created",
    files: { "/p/a.ts": "export const a = 1;" },
    run: p => {
      p.getFileSystem().writeFileSync("/p/dep.ts", "export const dep = 3;");
      p.addSourceFileAtPath("/p/dep.ts");
      p.getPreEmitDiagnostics();
      p.createSourceFile("/p/c.ts", `import { dep } from "./dep"; export const c = dep;`);
      p.removeSourceFile(p.getSourceFileOrThrow("/p/dep.ts"));
    },
    expected: {
      "/p/a.ts": "export const a = 1;",
      "/p/c.ts": `import { dep } from "./dep"; export const c = dep;`,
    },
    fsOnly: { "/p/dep.ts": "export const dep = 3;" },
  },
  {
    name: "a file whose triple slash reference brought another in",
    files: {
      "/p/a.ts": "export const a = 1;",
      "/p/b.ts": "/// <reference path=\"./ref.ts\" />\nexport const b = 2;",
      "/p/ref.ts": "declare const refd: number;",
    },
    run: p => p.removeSourceFile(p.getSourceFileOrThrow("/p/b.ts")),
    expected: { "/p/a.ts": "export const a = 1;", "/p/ref.ts": "declare const refd: number;" },
  },
];

function describe(project: Project): string {
  const lines: string[] = [];
  for (const file of project.getSourceFiles()) {
    lines.push(`file ${file.getFilePath()}`);
    lines.push(`  text ${JSON.stringify(file.getFullText())}`);
    for (const declaration of file.getImportDeclarations()) {
      const resolved = declaration.getModuleSpecifierSourceFile();
      lines.push(`  import ${declaration.getModuleSpecifierValue()} -> ${resolved?.getFilePath() ?? "<unresolved>"}`);
    }
    for (const ref of file.getReferencedSourceFiles()) lines.push(`  references ${ref.getFilePath()}`);
  }
  const diagnostics = project.getPreEmitDiagnostics()
    .map(d => `${d.getSourceFile()?.getFilePath() ?? ""}(${d.getStart() ?? -1}): ${d.getCode()}`)
    .sort();
  lines.push("--- diagnostics ---", ...diagnostics);
  lines.push("--- emitted ---");
  for (const output of project.emitToMemory().getFiles()) lines.push(`  ${output.filePath}`);
  return lines.join("\n");
}

function build(files: Files, fsOnly: Files = {}): Project {
  const project = new Project({ useInMemoryFileSystem: true });
  for (const [name, text] of Object.entries(fsOnly)) project.getFileSystem().writeFileSync(name, text);
  for (const [name, text] of Object.entries(files)) {
    if (name.endsWith(".json")) project.getFileSystem().writeFileSync(name, text);
    else project.createSourceFile(name, text);
  }
  return project;
}

let failed = 0;
for (const testCase of cases) {
  const incremental = build(testCase.files);
  // opened first, so the removals below run against a project that has answered
  incremental.getPreEmitDiagnostics();
  testCase.run(incremental);

  const fresh = build(testCase.expected, testCase.fsOnly);
  const left = describe(incremental);
  const right = describe(fresh);
  if (left === right)
    console.log(`ok   ${testCase.name}`);
  else {
    failed++;
    console.log(`FAIL ${testCase.name}`);
    const leftLines = left.split("\n");
    const rightLines = right.split("\n");
    for (let i = 0; i < Math.max(leftLines.length, rightLines.length); i++)
      if (leftLines[i] !== rightLines[i]) console.log(`  ${i}: ${leftLines[i] ?? "<none>"}\n     ${rightLines[i] ?? "<none>"}`);
  }
}

// and the loop the whole thing exists for, checked the same way at every step
{
  const rolling = new Project({ useInMemoryFileSystem: true });
  const live: string[] = [];
  for (let i = 0; i < 8; i++) {
    live.push(`/p/b${i}.ts`);
    rolling.createSourceFile(`/p/b${i}.ts`, `export const v${i} = ${i};`);
  }
  rolling.getPreEmitDiagnostics();
  for (let i = 0; i < 8; i++) {
    const added = `/p/c${i}.ts`;
    rolling.createSourceFile(added, `export const w${i} = ${i};`);
    rolling.removeSourceFile(rolling.getSourceFileOrThrow(live.shift()!));
    live.push(added);
    const fresh = build(Object.fromEntries(
      live.map(name => [name, rolling.getSourceFileOrThrow(name).getFullText()]),
    ));
    if (describe(rolling) !== describe(fresh)) {
      failed++;
      console.log(`FAIL rolling step ${i}`);
    }
  }
  if (failed === 0) console.log("ok   rolling create and delete");
}

if (failed > 0) {
  console.log(`\n${failed} failing`);
  process.exit(1);
}
console.log("\nRESULT: OK");
