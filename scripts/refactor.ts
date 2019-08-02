/**
 * Code Manipulation - Refactor
 * ----------------------------
 * Use this script as a strating point when refactoring the application.
 * Edit within the for..of loop.
 * ----------------------------
 */

import { InspectorFactory } from "./inspectors";
import { SyntaxKind, TypeGuards } from "ts-morph";

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
}

project.save();
const end = new Date().getTime() - start.getTime();
console.log(`FINISHED: ${end / 1000}s`);
