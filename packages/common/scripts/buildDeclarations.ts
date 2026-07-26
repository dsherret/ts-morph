import { createDeclarationProject, folders, makeConstructorsPrivate, path, tsMorph } from "./deps.ts";

/** Where the tsgo client's declarations are vendored to, relative to `lib`. */
const vendoredTsgoDir = "./tsgo";
/** The part of a submodule specifier that precedes the path within the client's `dist`. */
const clientDistSpecifier = "submodules/typescript-go/_packages/native-preview/dist/";

/** Memoizes stripComments, which runs once per candidate name otherwise. */
const strippedCache = new Map<string, string>();

const declarationProject = createDeclarationProject({
  tsConfigFilePath: path.join(folders.common, "tsconfig.json"),
});
const emitMainFile = declarationProject.getSourceFileOrThrow("./dist/index.d.ts");
const writeProject = new tsMorph.Project({
  compilerOptions: {
    target: tsMorph.ts.ScriptTarget.ES2023,
    moduleResolution: tsMorph.ts.ModuleResolutionKind.Bundler,
  },
  manipulationSettings: {
    indentationText: tsMorph.IndentationText.TwoSpaces,
    newLineKind: tsMorph.NewLineKind.LineFeed,
  },
});
const declarationFile = writeProject.addSourceFileAtPath("lib/ts-morph-common.d.ts");

writeTsNamespace();

const tsNamespaceExports = getTsNamespaceExports();
const typeOnlyTsExports = getTypeOnlyTsExports();
const clientImports = getClientImports();

const writer = declarationProject.createWriter();
const tsNames: string[] = [];
/** Compiler names the `ts` namespace does not carry, by the module they come from. */
const clientReExports = new Map<string, string[]>();
/** Every name the flattened file declares, so the header does not redeclare one. */
const declaredNames = new Set<string>();

for (const [name, declarations] of emitMainFile.getExportedDeclarations()) {
  if (name === "ts")
    continue;

  declaredNames.add(name);

  // Anything the compiler declares is reached through it rather than restated
  // here: through `ts` when the namespace carries the name, and otherwise from
  // the vendored client directly — `getChildren` and friends are part of the
  // compiler surface without being part of the `ts` namespace.
  if (isFromCompiler(declarations[0].getSourceFile())) {
    if (tsNamespaceExports.has(name))
      tsNames.push(name);
    else
      addClientReExport(name, declarations[0].getSourceFile());
  } else {
    for (const declaration of declarations) {
      if (tsMorph.Node.isJSDocable(declaration) && declaration.getJsDocs().some(d => d.getTags().some(t => t.getTagName() === "internal")))
        continue;

      if (writer.getLength() > 0)
        writer.newLine();

      if (tsMorph.Node.isVariableDeclaration(declaration)) {
        const statement = declaration.getVariableStatementOrThrow();
        if (statement.getDeclarations().length !== 1)
          throw new Error("Only var decls in a statement with a single decl are supported.");
        writer.writeLine(statement.getText(true));
      } else {
        writer.writeLine(declaration.getText(true));
      }
    }
  }
}

writer.blankLineIfLastNot();
for (const [specifier, names] of [...clientReExports].sort())
  writer.writeLine(`export { ${names.sort().join(", ")} } from "${specifier}";`);
for (const tsName of tsNames) {
  writer.writeLine(
    typeOnlyTsExports.has(tsName) ? `export type ${tsName} = ts.${tsName};` : `export import ${tsName} = ts.${tsName};`,
  );
}

writer.writeLine(`export { ts };`);

const body = rewriteInlineImports(writer.toString());
declarationFile.replaceWithText(header(body) + body);
makeConstructorsPrivate(declarationFile);
declarationFile.saveSync();

const diagnostics = writeProject.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(writeProject.formatDiagnosticsWithColorAndContext(diagnostics));
  console.log("Had write project diagnostics.");
  Deno.exit(1);
}

console.log(`wrote lib/ts-morph-common.d.ts (${tsNames.length} names re-exported from ts)`);

/**
 * The imports the flattened file needs on top of `ts`.
 *
 * Flattening drops the imports each declaration was written against, so any name
 * a declaration mentions but does not itself declare has to be reintroduced.
 * Where the name belongs to the `ts` namespace it is aliased back out of it —
 * with `import x = ts.y` rather than a type alias, because some of these are used
 * in namespace position (`NewLineKind.CRLF`) as well as type position. The rest
 * are the client's own session types, which are imported from the vendored copy.
 */
function header(body: string) {
  const lines = [`import { ts } from "./typescript";`];
  const fromClient = new Map<string, string[]>();
  const reintroduced = new Set<string>();

  // What the declaration actually imported comes first: it is the record of what
  // the name meant where it was written, so it decides even when the `ts`
  // namespace happens to export something under the same name.
  for (const [localName, imported] of clientImports) {
    if (declaredNames.has(localName) || !isReferenced(localName, body))
      continue;
    reintroduced.add(localName);
    if (tsNamespaceExports.has(imported.name))
      lines.push(aliasFromTs(localName, imported.name));
    else {
      const specifier = `${vendoredTsgoDir}/${imported.path}`;
      const names = fromClient.get(specifier) ?? [];
      names.push(imported.name === localName ? localName : `${imported.name} as ${localName}`);
      fromClient.set(specifier, names);
    }
  }

  // Then names the body uses that no import accounted for, which the `ts`
  // namespace declares itself.
  for (const name of tsNamespaceExports) {
    if (declaredNames.has(name) || reintroduced.has(name) || !isReferenced(name, body))
      continue;
    reintroduced.add(name);
    lines.push(aliasFromTs(name, name));
  }

  for (const [specifier, names] of [...fromClient].sort())
    lines.push(`import type { ${names.sort().join(", ")} } from "${specifier}";`);

  return lines.join("\n") + "\n\n";
}

/**
 * Retargets the inline `import("...")` types the emitter writes for a type it
 * could not name, which point into the submodule the client was built from.
 */
function rewriteInlineImports(text: string) {
  return text.replace(
    new RegExp(`(["'])(?:\\.\\./)*${clientDistSpecifier.replace(/\//g, "\\/")}([^"']+?)(?:\\.js)?\\1`, "g"),
    (_, quote, rest) => `${quote}${vendoredTsgoDir}/${rest}${quote}`,
  );
}

/**
 * Writes the `ts` namespace the flattened declarations are stated against.
 *
 * `lib/tsNamespace.d.ts` is `src/tsgo/ts.ts` as emitted, retargeted at the
 * vendored client, and `lib/typescript.d.ts` presents it under the name every
 * consumer of this package already imports. The namespace is a re-export rather
 * than a `declare namespace` block because its contents are largely the client's
 * own types, and restating thousands of lines of them here would only give them
 * a second place to drift from.
 */
function writeTsNamespace() {
  const emitted = declarationProject.getSourceFileOrThrow("./dist/tsgo/ts.d.ts");
  Deno.writeTextFileSync(path.join(folders.common, "lib/tsNamespace.d.ts"), rewriteInlineImports(emitted.getFullText()));
  Deno.writeTextFileSync(
    path.join(folders.common, "lib/typescript.d.ts"),
    `// Generated by scripts/buildDeclarations.ts. DO NOT EDIT.\n\nimport * as ts from "./tsNamespace";\nexport { ts };\n`,
  );
}

/** Every name the `ts` namespace provides. */
function getTsNamespaceExports() {
  const tsFile = declarationProject.getSourceFileOrThrow("./dist/tsgo/ts.d.ts");
  return new Set(tsFile.getExportedDeclarations().keys());
}

/**
 * The names the `ts` namespace exports as types only.
 *
 * They have to be aliased with `type x = ts.y` rather than `import x = ts.y`,
 * because an import alias may not name a type-only export. Nothing is lost:
 * a type-only export has no value or namespace meaning to carry across.
 *
 * A name can arrive both ways — `SyntaxKind` is re-exported as a value and also
 * swept up by an `export type *` over the AST module — and a value export wins.
 * Aliasing an enum as a type would compile and then fail every consumer that
 * writes `SyntaxKind.ClassDeclaration`.
 */
function getTypeOnlyTsExports() {
  const tsFile = declarationProject.getSourceFileOrThrow("./dist/tsgo/ts.d.ts");
  const typeOnly = new Set<string>();
  const values = new Set<string>();

  for (const exportDeclaration of tsFile.getExportDeclarations()) {
    const namedExports = exportDeclaration.getNamedExports();
    if (namedExports.length === 0) {
      // a star export: every name the module provides comes through it
      const moduleFile = exportDeclaration.getModuleSpecifierSourceFile();
      if (moduleFile == null)
        continue;
      const target = exportDeclaration.isTypeOnly() ? typeOnly : values;
      for (const name of moduleFile.getExportedDeclarations().keys())
        target.add(name);
      continue;
    }
    for (const namedExport of namedExports) {
      const name = namedExport.getAliasNode()?.getText() ?? namedExport.getName();
      (exportDeclaration.isTypeOnly() || namedExport.isTypeOnly() ? typeOnly : values).add(name);
    }
  }

  // a declaration written out in this file — `export const`, `export enum` — is a
  // value. Only ones declared here count: a name re-exported with `export type`
  // is a type here however it was declared where it came from.
  for (const [name, declarations] of tsFile.getExportedDeclarations()) {
    const declaredHere = declarations.filter(d => d.getSourceFile() === tsFile);
    if (declaredHere.some(d => !tsMorph.Node.isInterfaceDeclaration(d) && !tsMorph.Node.isTypeAliasDeclaration(d)))
      values.add(name);
  }

  for (const name of values)
    typeOnly.delete(name);
  return typeOnly;
}

/**
 * Every name the emitted declarations import from the tsgo client, by the local
 * name they use for it. Two modules importing the same name under different
 * aliases each get an entry, which is what lets an alias be resolved back.
 */
function getClientImports() {
  const result = new Map<string, { name: string; path: string }>();
  for (const file of declarationProject.getSourceFiles()) {
    for (const importDeclaration of file.getImportDeclarations()) {
      const specifier = importDeclaration.getModuleSpecifierValue();
      const index = specifier.indexOf(clientDistSpecifier);
      if (index === -1)
        continue;
      const modulePath = specifier.slice(index + clientDistSpecifier.length).replace(/\.js$/, "");
      for (const namedImport of importDeclaration.getNamedImports()) {
        const alias = namedImport.getAliasNode()?.getText() ?? namedImport.getName();
        // One local name has to mean one thing, because the flattened file has a
        // single scope. Two modules disagreeing about it would otherwise resolve
        // to whichever was read last, silently.
        const existing = result.get(alias);
        if (existing != null && (existing.name !== namedImport.getName() || existing.path !== modulePath)) {
          throw new Error(
            `The local name ${alias} means ${existing.name} from ${existing.path} in one module and `
              + `${namedImport.getName()} from ${modulePath} in another. Rename one of them.`,
          );
        }
        result.set(alias, { name: namedImport.getName(), path: modulePath });
      }
    }
  }
  return result;
}

/** Records `name` as re-exported from the vendored copy of the file that declares it. */
function addClientReExport(name: string, sourceFile: tsMorph.SourceFile) {
  const filePath = sourceFile.getFilePath();
  const index = filePath.indexOf(clientDistSpecifier);
  if (index === -1)
    throw new Error(`Expected ${name} to be declared inside the tsgo client, but it is in ${filePath}.`);
  const specifier = `${vendoredTsgoDir}/${filePath.slice(index + clientDistSpecifier.length).replace(/\.d\.ts$/, "")}`;
  const names = clientReExports.get(specifier) ?? [];
  names.push(name);
  clientReExports.set(specifier, names);
}

function isFromCompiler(sourceFile: tsMorph.SourceFile) {
  const filePath = sourceFile.getFilePath();
  if (filePath.includes(clientDistSpecifier) || filePath.endsWith("/dist/tsgo/ts.d.ts"))
    return true;
  if (sourceFile.isInNodeModules())
    throw new Error(`Unexpected scenario where source file was from: ${filePath}`);
  return false;
}

/**
 * Whether `name` appears in `text` as an identifier rather than as part of one.
 *
 * Comments are stripped first. Otherwise a name that only appears in prose —
 * `@param fileOrDirPath - Path to standardize` mentions `Path` — is read as a
 * reference and reintroduced for nothing.
 */
function isReferenced(name: string, text: string) {
  return new RegExp(`\\b${name}\\b`).test(stripComments(text));
}

/** `text` with its block and line comments blanked out. */
function stripComments(text: string) {
  let stripped = strippedCache.get(text);
  if (stripped === undefined)
    strippedCache.set(text, stripped = text.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ""));
  return stripped;
}

/** Brings `tsName` into scope under `localName`, however the namespace exports it. */
function aliasFromTs(localName: string, tsName: string) {
  return typeOnlyTsExports.has(tsName) ? `type ${localName} = ts.${tsName};` : `import ${localName} = ts.${tsName};`;
}
