/**
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This flattens the definition file output of the TypeScript compiler into one main.d.ts file.
 * ----------------------------------------------
 */
import * as path from "path";
import Project, { SourceFile, ClassDeclaration, TypeGuards, ts, SyntaxKind, VariableStatement } from "ts-simple-ast";
import { StringUtils, ArrayUtils } from "../src/utils";
import { getDefinitionProject } from "./common";
import { flattenDeclarationFiles } from "./flattenDeclarationFiles";

const project = getDefinitionProject();
// temporary until I can upgrade this project to 2.9
for (const sourceFile of project.getSourceFiles()) {
    // remove all import type expressions
    sourceFile.replaceText([0, sourceFile.getEnd()], sourceFile.getFullText().replace(/import\([^\)]+\).([A-Za-z]+)/g, "$1"));
}
const mainFile = project.getSourceFileOrThrow("main.d.ts");

flattenDeclarationFiles(project, mainFile);
hideBaseDeclarations();

project.save();

function hideBaseDeclarations() {
    const baseDeclarations = mainFile.getVariableDeclarations().filter(s => StringUtils.endsWith(s.getName(), "Base"));

    for (const declaration of baseDeclarations) {
        const variableStatement = declaration.getParentOrThrow().getParentOrThrow() as VariableStatement;
        if (variableStatement.getDeclarations().length > 1)
            throw new Error(`Unexpected. Found more than one declaration for ${declaration.getName()}.`);

        // the trick is to mark these as not exported in the declaration file
        variableStatement.setIsExported(false);
    }
}
