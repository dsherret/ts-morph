/**
 * Code Manipulation - Create Declaration File
 * -------------------------------------------
 * This flattens the declaration file output of the TypeScript compiler into one ts-morph.d.ts file
 * and hides any declarations that should be internal.
 * -------------------------------------------
 */
import * as os from "os";
import { Node, TypeGuards, Scope, ClassDeclaration, StructureKind, InterfaceDeclarationStructure, TypeAliasDeclarationStructure, FunctionDeclarationStructure,
    VariableStatementStructure,
    Type} from "ts-morph";
import { createDeclarationProject, forEachTypeText } from "../common";
import { getDeclarationFileStatements } from "./declarationFile";

// todo: remove this once this code's performance is improved.
// Basic idea here is to change this code to modify the structures rather than the source file

// Original times:
// Emitting declaration files [43s]
// Flattening... [46.5s]
// Removing import types... [73.7s]
// Making constructors private... [28.9s]
// Hiding base declarations... [18.9s]
// Hiding specific structures... [5.5s]
// Hiding extension types... [8.7s]
// Hiding specific declarations... [0.3s]
// Removing @skipOrThrowCheck... [11.6s]
// Moving file... [0.1ss]
// Total time: 337.33s

export async function createDeclarationFile() {
    let lastDateTime: Date | undefined;
    log("Emitting declaration files...");
    const project = createDeclarationProject();
    const mainFile = project.getSourceFileOrThrow("main.d.ts");
    const codeBlockWriterFile = project.getSourceFileOrThrow("dist-declarations/codeBlockWriter/code-block-writer.d.ts");
    codeBlockWriterFile.moveToDirectory(project.getDirectoryOrThrow("dist-declarations"));

    log("Getting statements...");
    const statements = getDeclarationFileStatements(mainFile, codeBlockWriterFile);
    log("Hiding specific structures...");
    hideSpecificStructures();
    log("Hiding extension types...");
    hideExtensionTypes();
    log("Hiding specific declarations...");
    hideSpecificDeclarations();
    log("Hiding base declarations...");
    hideBaseDeclarations();
    log("Removing import types...");
    statements.forEach(statement => forEachTypeText(
        statement,
        typeText => typeText
            .replace(/compiler\.([A-Za-z]+)/g, "$1")
            .replace(/ts\.(SyntaxKind)/g, "$1")
            .replace(/import\([^\)]+\)\./g, "")
    ));

    log("Printing...");
    mainFile.set({
        statements
    });

    // todo: will work on improving the rest of this later
    log("Making constructors private...");
    makeConstructorsPrivate();
    log("Removing @skipOrThrowCheck...");
    removeSkipOrThrowCheck();
    log("Adding getParent methods...");
    addGetParentMethods();
    log("Moving file...");
    mainFile.move("ts-morph.d.ts");
    finishLog(lastDateTime!);

    await Promise.all([codeBlockWriterFile.save(), mainFile.save()]);

    function hideSpecificStructures() {
        const specificStructures = statements
            .filter(s => s.kind === StructureKind.Interface && s.name.endsWith("SpecificStructure")) as InterfaceDeclarationStructure[];
        for (const structure of specificStructures)
            structure.isExported = false;
    }

    function hideExtensionTypes() {
        const extensionTypes = statements
            .filter(s => s.kind === StructureKind.TypeAlias && s.name.endsWith("ExtensionType")) as TypeAliasDeclarationStructure[];
        for (const extensionType of extensionTypes)
            extensionType.isExported = false;
    }

    function hideSpecificDeclarations() {
        (statements.find(s => s.kind === StructureKind.Function && s.name === "ClassLikeDeclarationBaseSpecific") as FunctionDeclarationStructure)
            .isExported = false;
        (statements.find(s => s.kind === StructureKind.Interface && s.name === "ClassLikeDeclarationBaseSpecific") as InterfaceDeclarationStructure)
            .isExported = false;
    }

    function hideBaseDeclarations() {
        const baseStatements = statements
            .filter(s => s.kind === StructureKind.VariableStatement && s.declarations.some(d => d.name.endsWith("Base"))) as VariableStatementStructure[];

        for (const statement of baseStatements) {
            if (statement.declarations.length > 1)
                throw new Error(`Unexpected. Found more than one declaration for ${JSON.stringify(statement)}.`);

            // the trick is to mark these as not exported in the declaration file
            statement.isExported = false;
        }
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

    function addGetParentMethods() {
        for (const classDec of mainFile.getClasses()) {
            const type = classDec.getType();
            if (type.getProperty("compilerNode") == null)
                continue;
            const nodeType = type.getBaseTypes()[0];
            if (nodeType == null)
                continue;
            const typeArgName = getTypeScriptTypeName(nodeType, classDec);
            if (typeArgName == null)
                continue;

            classDec.addMembers(writer => {
                writer.writeLine("/** @inheritdoc **/");
                writer.writeLine(`getParent(): NodeParentType<${typeArgName}>;`);
                writer.writeLine("/** @inheritdoc **/");
                writer.writeLine(`getParentOrThrow(): NonNullable<NodeParentType<${typeArgName}>>;`);
            });
        }

        function getTypeScriptTypeName(nodeType: Type, classDec: ClassDeclaration) {
            const types = [nodeType, ...nodeType.getIntersectionTypes()];
            for (const type of types) {
                for (const typeArg of type.getTypeArguments()) {
                    const typeArgName = typeArg.getText(classDec);
                    if (typeArgName.startsWith("ts."))
                        return typeArgName;
                }
            }

            return undefined;
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
