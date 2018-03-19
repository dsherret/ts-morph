/**
 * Code Manipulation - Create kind to node mappings
 * ------------------------------------------------
 * This creates the kindToNodeMappings.ts file so that type assertions are necessary in
 * the getDescendantsOfKind, getChildrenOfKind, etc... methods.
 * ----------------------------------------------
 */
import {ClassDeclaration, MethodDeclaration, MethodDeclarationStructure, MethodSignature, MethodSignatureStructure, JSDocStructure,
    ParameterDeclarationStructure, SourceFile, InterfaceDeclaration, TypeGuards, SyntaxKind} from "../src/main";
import {hasDescendantBaseType} from "./common";
import {TsSimpleAstInspector, TsInspector} from "./inspectors";

// this can go away once conditional types are well supported (maybe a few versions after)

export function createKindToNodeMappings(inspector: TsSimpleAstInspector, tsInspector: TsInspector) {
    const project = inspector.getProject();
    const kindToNodeMappingsFile = project.getSourceFileOrThrow("kindToNodeMappings.ts");
    const nodeToWrapperMappings = inspector.getNodeToWrapperMappings();
    kindToNodeMappingsFile.removeText();

    // add imports
    kindToNodeMappingsFile.addImportDeclaration({
        namespaceImport: "compiler",
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathToSourceFileAsModuleSpecifier(project.getSourceFileOrThrow("src/compiler/index.ts"))
    });
    kindToNodeMappingsFile.addImportDeclaration({
        namedImports: ["SyntaxKind"],
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathToSourceFileAsModuleSpecifier(project.getSourceFileOrThrow("src/typescript/index.ts"))
    });

    addTypeForSubSet("KindToNodeMappings", project.getSourceFileOrThrow("Node.ts").getClassOrThrow("Node"));
    addTypeForSubSet("KindToExpressionMappings", project.getSourceFileOrThrow("Expression.ts").getClassOrThrow("Expression"));

    kindToNodeMappingsFile.insertText(0, writer =>
        writer.writeLine("// DO NOT EDIT - Automatically maintained by createKindToNodeMappings.ts until conditional types have been released for a while."));

    function addTypeForSubSet(name: string, nodeClass: ClassDeclaration) {
        const classType = nodeClass.getType();
        const newInterface = kindToNodeMappingsFile.addInterface({
            isExported: true,
            name
        });

        newInterface.addIndexSignature({
            keyName: "kind",
            keyType: "number",
            returnType: "compiler.Node"
        });

        for (const mapping of nodeToWrapperMappings) {
            if (!hasDescendantBaseType(mapping.wrappedNode.getType(), t => t.getText() === classType.getText()))
                continue;
            for (const kindName of mapping.syntaxKindNames) {
                for (const possibleKindName of tsInspector.getNamesFromKind((SyntaxKind as any)[kindName])) {
                    newInterface.addProperty({
                        name: `[SyntaxKind.${possibleKindName}]`,
                        type: `compiler.${mapping.wrapperName}`
                    });
                }
            }
        }
    }
}
