/**
 * Code Manipulation - Create Declaration File
 * -------------------------------------------
 * This flattens the declaration file output of the TypeScript compiler into one main.d.ts file
 * and hides any declarations that should be internal.
 * -------------------------------------------
 */
import * as path from "path";
import Project, { Node, SourceFile, ClassDeclaration, TypeGuards, ts, SyntaxKind, VariableStatement } from "ts-simple-ast";
import { StringUtils } from "../../src/utils";
import { getDefinitionProject, removeImportTypes } from "../common";
import { flattenDeclarationFiles } from "./flattenDeclarationFiles";

export function createDeclarationFile() {
    const project = getDefinitionProject();
    const mainFile = project.getSourceFileOrThrow("main.d.ts");

    flattenDeclarationFiles(project, mainFile);
    removeImportTypes(mainFile);
    hideBaseDeclarations();
    hideSpecificStructures();
    hideExtensionTypes();
    removeSkipOrThrowCheck();

    project.save();

    function hideBaseDeclarations() {
        const baseDeclarations = mainFile.getVariableDeclarations().filter(s => StringUtils.endsWith(s.getName(), "Base"));

        for (const declaration of baseDeclarations) {
            const variableStatement = declaration.getParentOrThrow().getParentOrThrow() as Node as VariableStatement;
            if (variableStatement.getDeclarations().length > 1)
                throw new Error(`Unexpected. Found more than one declaration for ${declaration.getName()}.`);

            // the trick is to mark these as not exported in the declaration file
            variableStatement.setIsExported(false);
        }
    }

    function hideSpecificStructures() {
        const specificStructures = mainFile.getInterfaces().filter(s => StringUtils.endsWith(s.getName(), "SpecificStructure"));
        for (const structure of specificStructures)
            structure.setIsExported(false);
    }

    function hideExtensionTypes() {
        const extensionTypes = mainFile.getTypeAliases().filter(t => StringUtils.endsWith(t.getName(), "ExtensionType"));
        for (const extensionType of extensionTypes)
            extensionType.setIsExported(false);
    }

    function removeSkipOrThrowCheck() {
        // no real good support for jsdocs yet so doing this regex solution that I know will work
        mainFile.replaceWithText(mainFile.getFullText().replace(/\n\s+\*\s+@skipOrThrowCheck\r?\n/g, "\n"));
    }
}
