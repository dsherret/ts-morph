/**
 * Code Manipulation - Create kind to node mappings
 * ------------------------------------------------
 * This creates the kindToNodeMappings.ts file so that type assertions are necessary in
 * the getDescendantsOfKind, getChildrenOfKind, etc... methods.
 * ----------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import { hasDescendantBaseType } from "../common";
import { TsMorphInspector, TsInspector } from "../inspectors";

export function createKindToNodeMappings(inspector: TsMorphInspector, tsInspector: TsInspector) {
    const project = inspector.getProject();
    const kindToNodeMappingsFile = project.getSourceFileOrThrow("kindToNodeMappings.ts");
    const kindToWrapperMappings = inspector.getKindToWrapperMappings();
    kindToNodeMappingsFile.removeText();

    // add imports
    kindToNodeMappingsFile.insertText(0, writer => writer
        .writeLine("// DO NOT EDIT - Automatically maintained by createKindToNodeMappings.ts until conditional types have been released for a while."));
    kindToNodeMappingsFile.addImportDeclarations([{
        namedImports: ["SyntaxKind", "ts"],
        moduleSpecifier: "@ts-morph/common"
    }, {
        namespaceImport: "compiler",
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/compiler/ast/index.ts"))
    }]);

    addTypeForSubSet("ImplementedKindToNodeMappings", project.getSourceFileOrThrow("Node.ts").getClassOrThrow("Node"));
    addDefaultIndexSignature(kindToNodeMappingsFile.addInterface({
        isExported: true,
        name: "KindToNodeMappings",
        extends: ["ImplementedKindToNodeMappings"]
    }));
    addDefaultIndexSignature(addTypeForSubSet("KindToExpressionMappings", project.getSourceFileOrThrow("Expression.ts").getClassOrThrow("Expression")));

    function addTypeForSubSet(name: string, nodeClass: tsMorph.ClassDeclaration) {
        const classType = nodeClass.getType();
        const addingProperties: tsMorph.PropertySignatureStructure[] = [];
        const newInterface = kindToNodeMappingsFile.addInterface({
            isExported: true,
            name
        });

        for (const mapping of kindToWrapperMappings) {
            if (!hasDescendantBaseType(mapping.wrappedNode.getType(), t => t.getText() === classType.getText()))
                continue;
            for (const kindName of mapping.syntaxKindNames) {
                for (const possibleKindName of tsInspector.getNamesFromKind(tsInspector.getSyntaxKindForName(kindName))) {
                    addingProperties.push({
                        kind: tsMorph.StructureKind.PropertySignature,
                        name: `[SyntaxKind.${possibleKindName}]`,
                        type: getNodeType(mapping.wrapperName, kindName)
                    });
                }
            }
        }

        newInterface.addProperties(addingProperties);
        newInterface.getChildren().forEach(c => c.forget());

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

    function addDefaultIndexSignature(interfaceDec: tsMorph.InterfaceDeclaration) {
        interfaceDec.insertIndexSignature(0, {
            keyName: "kind",
            keyType: "number",
            returnType: "compiler.Node"
        });
    }
}
