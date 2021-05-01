/**
 * Code Manipulation - Create kind to node mappings
 * ------------------------------------------------
 * This creates the kindToNodeMappings.ts file so that type assertions are necessary in
 * the getDescendantsOfKind, getChildrenOfKind, etc... methods.
 * ----------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import { hasDescendantBaseType } from "../common";
import { TsInspector, TsMorphInspector } from "../inspectors";

export function createKindToNodeMappings(inspector: TsMorphInspector, tsInspector: TsInspector) {
    const project = inspector.getProject();
    const kindToNodeMappingsFile = project.getSourceFileOrThrow("kindToNodeMappings.ts");
    const kindToWrapperMappings = inspector.getKindToWrapperMappings();

    const interfaceStructures: tsMorph.InterfaceDeclarationStructure[] = [];
    interfaceStructures.push(getTypeForSubSet("ImplementedKindToNodeMappings", project.getSourceFileOrThrow("Node.ts").getClassOrThrow("Node")));
    interfaceStructures.push(withDefaultIndexSignature({
        kind: tsMorph.StructureKind.Interface,
        isExported: true,
        name: "KindToNodeMappings",
        extends: ["ImplementedKindToNodeMappings"],
    }));
    interfaceStructures.push(
        withDefaultIndexSignature(getTypeForSubSet("KindToExpressionMappings", project.getSourceFileOrThrow("Expression.ts").getClassOrThrow("Expression"))),
    );

    // add imports
    kindToNodeMappingsFile.removeText();
    kindToNodeMappingsFile.addStatements([
        writer =>
            writer
                .writeLine("// DO NOT EDIT - Automatically maintained by createKindToNodeMappings.ts")
                .writeLine("// Edit factories/kindToWrapperMappings.ts then run yarn code-generate instead."),
        {
            kind: tsMorph.StructureKind.ImportDeclaration,
            namedImports: ["SyntaxKind", "ts"],
            moduleSpecifier: "@ts-morph/common",
        },
        {
            kind: tsMorph.StructureKind.ImportDeclaration,
            namespaceImport: "compiler",
            moduleSpecifier: kindToNodeMappingsFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/compiler/ast/index.ts")),
        },
        ...interfaceStructures,
    ]);

    function getTypeForSubSet(name: string, nodeClass: tsMorph.ClassDeclaration) {
        const classType = nodeClass.getType();
        const addingProperties: tsMorph.PropertySignatureStructure[] = [];
        const newInterface: tsMorph.InterfaceDeclarationStructure = {
            kind: tsMorph.StructureKind.Interface,
            isExported: true,
            name,
        };

        for (const mapping of kindToWrapperMappings) {
            if (!hasDescendantBaseType(mapping.wrappedNode.getType(), t => t.getText() === classType.getText()))
                continue;
            for (const kindName of mapping.syntaxKindNames) {
                for (const possibleKindName of tsInspector.getNamesFromKind(tsInspector.getSyntaxKindForName(kindName))) {
                    addingProperties.push({
                        kind: tsMorph.StructureKind.PropertySignature,
                        name: `[SyntaxKind.${possibleKindName}]`,
                        type: getNodeType(mapping.wrapperName, kindName),
                    });
                }
            }
        }

        newInterface.properties = addingProperties;

        return newInterface;

        function getNodeType(wrapperName: string, syntaxKindName: string) {
            if (isToken())
                return `compiler.Node<ts.Token<SyntaxKind.${syntaxKindName}>>`;
            return `compiler.${wrapperName}`;

            function isToken() {
                if (wrapperName !== "Node")
                    return false;
                return tsInspector.isTokenKind(tsInspector.getSyntaxKindForName(syntaxKindName));
            }
        }
    }

    function withDefaultIndexSignature(interfaceStructure: tsMorph.InterfaceDeclarationStructure) {
        interfaceStructure.indexSignatures = [{
            keyName: "kind",
            keyType: "number",
            returnType: "compiler.Node",
        }, ...interfaceStructure.indexSignatures ?? []];
        return interfaceStructure;
    }
}
