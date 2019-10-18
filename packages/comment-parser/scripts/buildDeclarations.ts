import * as path from "path";
import { Project, NewLineKind } from "ts-morph";
import { createDeclarationProject, makeConstructorsPrivate } from "@ts-morph/scripts";

const declarationProject = createDeclarationProject({
    tsConfigFilePath: path.join(__dirname, "../tsconfig.json")
});
const emitMainFile = declarationProject.getSourceFileOrThrow("./dist/index.d.ts");
const writeProject = new Project({
    manipulationSettings: {
        newLineKind: NewLineKind.CarriageReturnLineFeed
    }
});
const declarationFile = writeProject.addExistingSourceFile("lib/ts-morph-comment-parser.d.ts");

const writer = declarationProject.createWriter();

for (const [_, declarations] of emitMainFile.getExportedDeclarations()) {
    for (const declaration of declarations) {
        if (writer.getLength() > 0)
            writer.newLine();

        writer.writeLine(declaration.getText(true));
    }
}

// todo: format using dprint
declarationFile.replaceWithText(writer.toString());
makeConstructorsPrivate(declarationFile);
declarationFile.saveSync();

const diagnostics = writeProject.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
    console.log(writeProject.formatDiagnosticsWithColorAndContext(diagnostics));
    process.exit(1);
}
