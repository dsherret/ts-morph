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

const compilerDir = project.getDirectoryOrThrow("./src/compiler");
const astDir = project.getDirectoryOrThrow("./src/compiler/ast");
const commonDir = project.getDirectoryOrThrow("./src/compiler/ast/common");
const nodeSourceFile = project.getSourceFileOrThrow("./src/compiler/ast/common/Node.ts");

for (let i = 0; i < sourceFiles.length; i++) {
    const sourceFile = sourceFiles[i];
    console.log(`[${i + 1}/${sourceFiles.length}] Updating: ${sourceFile.getFilePath()}`);
    // DON'T CHECK IN THE CHANGES WITHIN THIS BLOCK
    for (const importDec of sourceFile.getImportDeclarations()) {
        for (const namedImport of importDec.getNamedImports()) {
            if (namedImport.getText() === "TypeGuards") {
                if (importDec.getNamedImports().length === 1)
                    importDec.remove();
                else
                    namedImport.remove();

                let searchingModuleSpecifier: string;
                if (!compilerDir.isAncestorOf(sourceFile))
                    searchingModuleSpecifier = sourceFile.getRelativePathAsModuleSpecifierTo(compilerDir);
                else if (!astDir.isAncestorOf(sourceFile))
                    searchingModuleSpecifier = sourceFile.getRelativePathAsModuleSpecifierTo(astDir);
                else if (!commonDir.isAncestorOf(sourceFile))
                    searchingModuleSpecifier = sourceFile.getRelativePathAsModuleSpecifierTo(commonDir);
                else
                    searchingModuleSpecifier = sourceFile.getRelativePathAsModuleSpecifierTo(nodeSourceFile);
                const commonImport = sourceFile.getImportDeclaration(searchingModuleSpecifier);
                if (commonImport != null) {
                    if (!commonImport.getNamedImports().some(n => n.getText() === "Node"))
                        commonImport.addNamedImport("Node");
                }
                else {
                    sourceFile.addImportDeclaration({
                        namedImports: ["Node"],
                        moduleSpecifier: searchingModuleSpecifier
                    });
                }
                break;
            }
        }
    }
    if (!sourceFile.getFilePath().endsWith("TypeGuards.ts")) {
        sourceFile.forEachDescendant(descendant => {
            if (TypeGuards.isIdentifier(descendant)) {
                if (descendant.getText() === "TypeGuards")
                    descendant.replaceWithText("Node");
            }
        });
    }
}

project.save();
const end = new Date().getTime() - start.getTime();
console.log(`FINISHED: ${end / 1000}s`);

function moveNamedImportDec(sourceFile: SourceFile) {
}
