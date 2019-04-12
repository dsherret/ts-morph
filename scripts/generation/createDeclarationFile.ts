/**
 * Code Manipulation - Create Declaration File
 * -------------------------------------------
 * This flattens the declaration file output of the TypeScript compiler into one ts-morph.d.ts file
 * and hides any declarations that should be internal.
 * -------------------------------------------
 */
import * as os from "os";
import { Node, VariableStatement, TypeGuards, Scope, ClassDeclaration } from "ts-morph";
import { createDeclarationProject, removeImportTypes } from "../common";
import { flattenDeclarationFiles } from "./flattenDeclarationFiles";

export async function createDeclarationFile() {
    let lastDateTime: Date | undefined;
    log("Emitting declaration files...");
    const project = createDeclarationProject();
    const mainFile = project.getSourceFileOrThrow("main.d.ts");

    // todo: will work on drastically speeding this up later...

    log("Flattening...");
    flattenDeclarationFiles(project, mainFile);
    log("Removing import types...");
    removeImportTypes(mainFile);
    log("Making constructors private...");
    makeConstructorsPrivate();
    log("Hiding base declarations...");
    hideBaseDeclarations();
    log("Hiding specific structures...");
    hideSpecificStructures();
    log("Hiding extension types...");
    hideExtensionTypes();
    log("Hiding specific declarations...");
    hideSpecificDeclarations();
    log("Removing @skipOrThrowCheck...");
    removeSkipOrThrowCheck();
    log("Moving file...");
    mainFile.move("ts-morph.d.ts");
    finishLog(lastDateTime!);

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

    function log(message: string) {
        if (lastDateTime != null)
            finishLog(lastDateTime);
        process.stdout.write(`  * ${message}`);
        lastDateTime = new Date();
    }

    function finishLog(dateTime: Date) {
        const differenceMs = new Date().getTime() - dateTime.getTime();
        const differenceSeconds = Math.round(differenceMs / 100) / 10;
        process.stdout.write(` [${differenceSeconds}s] ${os.EOL}`);
    }
}
