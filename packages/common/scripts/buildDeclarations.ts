import { createDeclarationProject, folders, makeConstructorsPrivate, path, tsMorph } from "./deps.ts";

const declarationProject = createDeclarationProject({
  tsConfigFilePath: path.join(folders.common, "tsconfig.json"),
});
const emitMainFile = declarationProject.getSourceFileOrThrow("./dist/index.d.ts");
const writeProject = new tsMorph.Project({
  compilerOptions: {
    target: tsMorph.ts.ScriptTarget.ES2018,
    moduleResolution: tsMorph.ts.ModuleResolutionKind.Bundler,
  },
  manipulationSettings: {
    indentationText: tsMorph.IndentationText.TwoSpaces,
    newLineKind: tsMorph.NewLineKind.LineFeed,
  },
});
const declarationFile = writeProject.addSourceFileAtPath("lib/ts-morph-common.d.ts");

const writer = declarationProject.createWriter();
writer.write(`import * as ts from `).quote("./typescript").write(";").newLine();

const tsNames: string[] = [];

for (const [name, declarations] of emitMainFile.getExportedDeclarations()) {
  if (name === "ts")
    continue;

  if (declarations[0].getSourceFile().isInNodeModules()) {
    const filePath = declarations[0].getSourceFile().getFilePath();
    if (!filePath.includes("node_modules/typescript"))
      throw new Error(`Unexpected scenario where source file was from: ${filePath}`);
    tsNames.push(name);
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
writer.writeLine(`import { ${tsNames.join(", ")} } from "./typescript";`);
writer.writeLine(`export { ts, ${tsNames.join(", ")} };`);

// todo: format using dprint
declarationFile.replaceWithText(writer.toString());
makeConstructorsPrivate(declarationFile);
declarationFile.saveSync();

const diagnostics = writeProject.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(writeProject.formatDiagnosticsWithColorAndContext(diagnostics));
  console.log("Had write project diagnostics.");
  Deno.exit(1);
}
