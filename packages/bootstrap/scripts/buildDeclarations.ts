import { createDeclarationProject, folders, makeConstructorsPrivate, path, tsMorph } from "./deps.ts";

const declarationProject = createDeclarationProject({
  tsConfigFilePath: path.join(folders.bootstrap, "tsconfig.json"),
});
const emitMainFile = declarationProject.getSourceFileOrThrow("./dist/index.d.ts");
const writeProject = new tsMorph.Project({
  manipulationSettings: {
    indentationText: tsMorph.IndentationText.TwoSpaces,
    newLineKind: tsMorph.NewLineKind.LineFeed,
  },
});
const declarationFile = writeProject.addSourceFileAtPath("lib/ts-morph-bootstrap.d.ts");

const writer = declarationProject.createWriter();
writer.writeLine(`import { RuntimeDirEntry, ts } from "@ts-morph/common";`);

for (const [name, declarations] of emitMainFile.getExportedDeclarations()) {
  if (name === "ts")
    continue;
  else {
    for (const declaration of declarations) {
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
writer.writeLine(`export { ts };`);

// todo: format using dprint
declarationFile.replaceWithText(writer.toString());
makeConstructorsPrivate(declarationFile);
declarationFile.saveSync();

const diagnostics = writeProject.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.log(writeProject.formatDiagnosticsWithColorAndContext(diagnostics));
  Deno.exit(1);
}
