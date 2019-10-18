/**
 * Code Manipulation - Refactor
 * ----------------------------
 * Use this script as a strating point when refactoring the application.
 * Edit within the for..of loop.
 * ----------------------------
 */

import { InspectorFactory } from "./inspectors";
import { SyntaxKind, TypeGuards, SourceFile } from "ts-morph";

const factory = new InspectorFactory();
const tsaInspector = factory.getTsMorphInspector();
const project = factory.getProject();
const directory = tsaInspector.getSrcDirectory();
const sourceFiles = directory.getDescendantSourceFiles();
const start = new Date();

for (let i = 0; i < sourceFiles.length; i++) {
    const sourceFile = sourceFiles[i];
    console.log(`[${i + 1}/${sourceFiles.length}] Updating: ${sourceFile.getFilePath()}`);
    // DON'T CHECK IN THE CHANGES WITHIN THIS BLOCK
    // moveNamedImportDec(sourceFile, "SettingsContainer", "@ts-morph/common")
}

project.save();
const end = new Date().getTime() - start.getTime();
console.log(`FINISHED: ${end / 1000}s`);

function moveNamedImportDec(sourceFile: SourceFile, searchingNamedImport: string, newModuleSpecifier: string) {
    for (const importDec of sourceFile.getImportDeclarations()) {
        for (const namedImport of importDec.getNamedImports()) {
            if (namedImport.getText() === searchingNamedImport) {
                if (importDec.getNamedImports().length === 1)
                    importDec.remove();
                else
                    namedImport.remove();

                const commonImport = sourceFile.getImportDeclaration(newModuleSpecifier);
                if (commonImport != null)
                    commonImport.addNamedImport(searchingNamedImport);
                else {
                    sourceFile.insertImportDeclaration(0, {
                        namedImports: [searchingNamedImport],
                        moduleSpecifier: newModuleSpecifier
                    });
                }
                break;
            }
        }
    }
}
