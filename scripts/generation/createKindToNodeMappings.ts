/**
 * Code Manipulation - Create kind to node mappings
 * ------------------------------------------------
 * This creates the kindToNodeMappings.ts file so that type assertions are necessary in
 * the getDescendantsOfKind, getChildrenOfKind, etc... methods.
 * ----------------------------------------------
 */
import { ClassDeclaration, InterfaceDeclaration, PropertySignatureStructure, SyntaxKind, StructureKind } from "ts-morph";
import { hasDescendantBaseType } from "../common";
import { TsMorphInspector, TsInspector } from "../inspectors";

// this can go away once conditional types are well supported (maybe a few versions after)

export function createKindToNodeMappings(inspector: TsMorphInspector, tsInspector: TsInspector) {
    const project = inspector.getProject();
    const kindToNodeMappingsFile = project.getSourceFileOrThrow("kindToNodeMappings.ts");
    const kindToWrapperMappings = inspector.getKindToWrapperMappings();
    kindToNodeMappingsFile.removeText();

    // add imports
    kindToNodeMappingsFile.addImportDeclaration({
        namespaceImport: "compiler",
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/compiler/ast/index.ts"))
    });
    kindToNodeMappingsFile.addImportDeclaration({
        namedImports: ["SyntaxKind"],
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/typescript/index.ts"))
    });

    addTypeForSubSet("ImplementedKindToNodeMappings", project.getSourceFileOrThrow("Node.ts").getClassOrThrow("Node"));
    addDefaultIndexSignature(kindToNodeMappingsFile.addInterface({
        isExported: true,
        name: "KindToNodeMappings",
        extends: ["ImplementedKindToNodeMappings"]
    }));
    addDefaultIndexSignature(addTypeForSubSet("KindToExpressionMappings", project.getSourceFileOrThrow("Expression.ts").getClassOrThrow("Expression")));

    kindToNodeMappingsFile.insertText(0, writer =>
        writer.writeLine("// DO NOT EDIT - Automatically maintained by createKindToNodeMappings.ts until conditional types have been released for a while."));

    function addTypeForSubSet(name: string, nodeClass: ClassDeclaration) {
        const classType = nodeClass.getType();
        const addingProperties: PropertySignatureStructure[] = [];
        const newInterface = kindToNodeMappingsFile.addInterface({
            isExported: true,
            name
        });

        for (const mapping of kindToWrapperMappings) {
            if (!hasDescendantBaseType(mapping.wrappedNode.getType(), t => t.getText() === classType.getText()))
                continue;
            for (const kindName of mapping.syntaxKindNames) {
                for (const possibleKindName of tsInspector.getNamesFromKind((SyntaxKind as any)[kindName])) {
                    addingProperties.push({
                        kind: StructureKind.PropertySignature,
                        name: `[SyntaxKind.${possibleKindName}]`,
                        type: `compiler.${mapping.wrapperName}`
                    });
                }
            }
        }

        newInterface.addProperties(addingProperties);
        newInterface.getChildren().forEach(c => c.forget());

        return newInterface;
    }

    function addDefaultIndexSignature(interfaceDec: InterfaceDeclaration) {
        interfaceDec.insertIndexSignature(0, {
            keyName: "kind",
            keyType: "number",
            returnType: "compiler.Node"
        });
    }
}
