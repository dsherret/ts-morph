/**
 * Code Manipulation - Create compiler node to wrapped type
 * ------------------------------------------------------------
 * This creates the CompilerNodeToWrappedType.ts file.
 * ------------------------------------------------------------
 */
import { TsSimpleAstInspector, WrappedNode } from "../inspectors";

export function createCompilerNodeToWrappedType(inspector: TsSimpleAstInspector) {
    // todo: use inspector.getDependencyNodes() and remove getWrappedNodesInDependencyOrder
    const project = inspector.getProject();
    const kindToNodeMappingsFile = project.getSourceFileOrThrow("CompilerNodeToWrappedType.ts");
    const wrappedNodes = getWrappedNodesInDependencyOrder([...inspector.getWrappedNodes()]);
    kindToNodeMappingsFile.removeText();

    // add imports
    kindToNodeMappingsFile.addImportDeclaration({
        namespaceImport: "compiler",
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/compiler/ast/index.ts"))
    });
    kindToNodeMappingsFile.addImportDeclaration({
        namedImports: ["ts"],
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/typescript/index.ts"))
    });

    // create the type
    kindToNodeMappingsFile.addTypeAlias({
        isExported: true,
        name: "CompilerNodeToWrappedType",
        typeParameters: [{ name: "T", constraint: "ts.Node" }],
        type: writer => {
            let isFirst = true;
            for (const wrapper of wrappedNodes) {
                const nodes = wrapper.getAssociatedTsNodes();
                if (nodes.length === 0)
                    continue;
                if (isFirst)
                    isFirst = false;
                else
                    writer.newLine().indent();
                writer.write(`T extends ts.${nodes[0].getNameForType()} ? compiler.${wrapper.getName()} :`);
            }
            writer.write(" compiler.Node<T>");
        }
    });

    kindToNodeMappingsFile.insertText(0, writer =>
        writer.writeLine("// DO NOT EDIT - Automatically maintained by createCompilerNodeToWrappedType.ts"));
}

function getWrappedNodesInDependencyOrder(wrappedNodes: WrappedNode[]) {
    // get the wrapped nodes with the base types at the end of the array
    for (let i = 0; i < wrappedNodes.length; i++) {
        const baseNodes = wrappedNodes[i].getBases();
        for (const baseNode of baseNodes) {
            const baseIndex = wrappedNodes.indexOf(baseNode);
            if (baseIndex < i) {
                wrappedNodes.splice(baseIndex, 1);
                i--;
                wrappedNodes.splice(i + 1, 0, baseNode);
            }
        }
    }
    return wrappedNodes;
}
