/**
 * Code Manipulation - Create Declaration File
 * -------------------------------------------
 * This flattens the declaration file output of the TypeScript compiler into one ts-simple-ast.d.ts file
 * and hides any declarations that should be internal.
 * -------------------------------------------
 */
import { Node, VariableStatement, TypeGuards, Scope } from "ts-simple-ast";
import { StringUtils } from "../../src/utils";
import { createDeclarationProject, removeImportTypes } from "../common";
import { flattenDeclarationFiles } from "./flattenDeclarationFiles";

export async function createDeclarationFile() {
    const project = createDeclarationProject();
    const mainFile = project.getSourceFileOrThrow("main.d.ts");

    flattenDeclarationFiles(project, mainFile);
    removeImportTypes(mainFile);
    makeConstructorsPrivate();
    hideBaseDeclarations();
    hideSpecificStructures();
    hideExtensionTypes();
    hideSpecificDeclarations();
    removeSkipOrThrowCheck();
    mainFile.move("ts-simple-ast.d.ts");

    await project.save();

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

    function hideSpecificDeclarations() {
        mainFile.getFunctionOrThrow("ClassLikeDeclarationBaseSpecific").setIsExported(false);
        mainFile.getInterfaceOrThrow("ClassLikeDeclarationBaseSpecific").setIsExported(false);
    }

    function removeSkipOrThrowCheck() {
        // no real good support for jsdocs yet so doing this regex solution that I know will work
        mainFile.replaceWithText(mainFile.getFullText().replace(/\n\s+\*\s+@skipOrThrowCheck\r?\n/g, "\n"));
    }

    function makeConstructorsPrivate() {
        mainFile.forEachDescendant(node => {
            if (!TypeGuards.isClassDeclaration(node))
                return;

            for (const ctor of node.getConstructors()) {
                const hasPrivateTag = ctor.getJsDocs().some(doc => doc.getTags().some(tag => tag.getTagName() === "private"));
                if (hasPrivateTag) {
                    ctor.getParameters().forEach(p => p.remove());
                    ctor.getJsDocs().forEach(d => d.remove());
                    ctor.setScope(node.getDerivedClasses().length > 0 ? Scope.Protected : Scope.Private);
                }
            }
        });
    }
}
