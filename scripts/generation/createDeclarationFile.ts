/**
 * Code Manipulation - Create Declaration File
 * -------------------------------------------
 * This flattens the declaration file output of the TypeScript compiler into one ts-morph.d.ts file
 * and hides any declarations that should be internal.
 * -------------------------------------------
 */
import { Node, VariableStatement, TypeGuards, Scope, ClassDeclaration } from "ts-morph";
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
    mainFile.move("ts-morph.d.ts");

    await project.save();

    function hideBaseDeclarations() {
        const baseDeclarations = mainFile.getVariableDeclarations().filter(s => s.getName().endsWith("Base"));

        for (const declaration of baseDeclarations) {
            const variableStatement = declaration.getParentOrThrow().getParentOrThrow() as Node as VariableStatement;
            if (variableStatement.getDeclarations().length > 1)
                throw new Error(`Unexpected. Found more than one declaration for ${declaration.getName()}.`);

            // the trick is to mark these as not exported in the declaration file
            variableStatement.setIsExported(false);
        }
    }

    function hideSpecificStructures() {
        const specificStructures = mainFile.getInterfaces().filter(s => s.getName().endsWith("SpecificStructure"));
        for (const structure of specificStructures)
            structure.setIsExported(false);
    }

    function hideExtensionTypes() {
        const extensionTypes = mainFile.getTypeAliases().filter(t => t.getName().endsWith("ExtensionType"));
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
        forEachDescendant(mainFile);

        function forEachDescendant(node: Node) {
            node.forEachChild(forEachDescendant);

            if (TypeGuards.isClassDeclaration(node))
                withClass(node);

            if (!TypeGuards.isSourceFile(node))
                node.forget();

            function withClass(classDec: ClassDeclaration) {
                for (const ctor of classDec.getConstructors()) {
                    const hasPrivateTag = ctor.getJsDocs().some(doc => doc.getTags().some(tag => tag.getTagName() === "private"));
                    if (hasPrivateTag) {
                        ctor.getParameters().forEach(p => p.remove());
                        ctor.getJsDocs().forEach(d => d.remove());
                        ctor.setScope(classDec.getDerivedClasses().length > 0 ? Scope.Protected : Scope.Private);
                    }
                }
            }
        }
    }
}
