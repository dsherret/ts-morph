/**
 * Code Manipulation - Refactor
 * ----------------------------
 * Use this script as a strating point when refactoring the application.
 * Edit within the for..of loop.
 * ----------------------------
 */

import {InspectorFactory} from "./inspectors";

const factory = new InspectorFactory();
const tsaInspector = factory.getTsSimpleAstInspector();
const project = factory.getProject();
const directory = tsaInspector.getSrcDirectory();

for (const sourceFile of directory.getDescendantSourceFiles()) {
    /* DON'T CHECK IN THE CHANGES WITHIN THIS BLOCK */
}

project.save();
