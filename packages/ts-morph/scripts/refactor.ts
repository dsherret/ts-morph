/**
 * Code Manipulation - Refactor
 * ----------------------------
 * Use this script as a strating point when refactoring the application.
 * Edit within the for..of loop.
 * ----------------------------
 */

import { tsMorph } from "@ts-morph/scripts";
import { InspectorFactory } from "./inspectors";

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
}

project.save();
const end = new Date().getTime() - start.getTime();
console.log(`FINISHED: ${end / 1000}s`);
