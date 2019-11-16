import * as path from "path";
import { createDeclarationProject, makeConstructorsPrivate, tsMorph } from "@ts-morph/scripts";

const declarationProject = createDeclarationProject({
    tsConfigFilePath: path.join(__dirname, "../tsconfig.json")
});
const emitMainFile = declarationProject.getSourceFileOrThrow("./dist/index.d.ts");
const writeProject = new tsMorph.Project({
    manipulationSettings: {
        newLineKind: tsMorph.NewLineKind.CarriageReturnLineFeed
    }
});
const declarationFile = writeProject.addSourceFileAtPath("lib/ts-morph-bootstrap.d.ts");

const writer = declarationProject.createWriter();
writer.writeLine(`import { ts } from "@ts-morph/common";`);

for (const [name, declarations] of emitMainFile.getExportedDeclarations()) {
    if (name === "ts")
        continue;
    else {
        for (const declaration of declarations) {
            if (writer.getLength() > 0)
                writer.newLine();

            writer.writeLine(declaration.getText(true));
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
    process.exit(1);
}
