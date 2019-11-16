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
const declarationFile = writeProject.addSourceFileAtPath("lib/ts-morph-common.d.ts");

const writer = declarationProject.createWriter();
writer.write(`import * as ts from `).quote("typescript").write(";").newLine();

const tsNames: string[] = [];

for (const [name, declarations] of emitMainFile.getExportedDeclarations()) {
    if (name === "ts")
        continue;
    else if (declarations[0].getSourceFile().isInNodeModules()) {
        const filePath = declarations[0].getSourceFile().getFilePath();
        if (!filePath.includes("node_modules/typescript"))
            throw new Error(`Unexpected scenario where source file was from: ${filePath}`);
        tsNames.push(name);
    }
    else {
        for (const declaration of declarations) {
            if (writer.getLength() > 0)
                writer.newLine();

            writer.writeLine(declaration.getText(true));
        }
    }
}

writer.blankLineIfLastNot();
writer.writeLine(`import { ${tsNames.join(", ")} } from "typescript";`);
writer.writeLine(`export { ts, ${tsNames.join(", ")} };`);

// todo: format using dprint
declarationFile.replaceWithText(writer.toString());
makeConstructorsPrivate(declarationFile);
declarationFile.saveSync();

const diagnostics = writeProject.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
    console.log(writeProject.formatDiagnosticsWithColorAndContext(diagnostics));
    process.exit(1);
}
