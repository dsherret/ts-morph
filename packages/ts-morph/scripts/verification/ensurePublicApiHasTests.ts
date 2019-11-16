/**
 * Code Verification - Ensure Public API Has Tests
 * -----------------------------------------------
 * This code verification checks that all methods and properties
 * in the public api appear in the tests.
 * -----------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import { TsMorphInspector } from "../inspectors";
import { hasInternalDocTag } from "../common";
import { Problem } from "./Problem";

export function ensurePublicApiHasTests(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
    const nodes: (tsMorph.Node & tsMorph.ReferenceFindableNode)[] = [];

    function tryAddNode(node: tsMorph.Node & tsMorph.ReferenceFindableNode) {
        if (tsMorph.TypeGuards.isScopedNode(node) && node.getScope() !== tsMorph.Scope.Public)
            return;
        if (hasInternalDocTag(node))
            return;
        nodes.push(node);
    }

    for (const dec of [...inspector.getPublicClasses(), ...inspector.getPublicInterfaces()]) {
        const filePath = dec.getSourceFile().getFilePath();
        // ignore paths that don't need testing
        if (filePath.endsWith("src/typescript/typescript.ts")
            || filePath.endsWith("src/utils/TypeGuards.ts")
            || filePath.endsWith("src/compiler/kindToNodeMappings.ts")
            || filePath.endsWith("src/codeBlockWriter/code-block-writer.ts"))
        {
            continue;
        }

        for (const node of dec.getProperties())
            tryAddNode(node);
        for (const node of dec.getMethods()) {
            if (tsMorph.TypeGuards.isMethodDeclaration(node)) {
                const overloads = node.getOverloads();
                if (overloads.length > 0) {
                    for (const overload of overloads)
                        tryAddNode(overload);
                    continue;
                }
            }
            tryAddNode(node);
        }
    }

    for (const node of nodes) {
        const referencingNodes = node.findReferencesAsNodes();
        const testsReference = referencingNodes.some(n => n.getSourceFile().getFilePath().includes("/src/tests"));

        if (!testsReference) {
            addProblem({
                filePath: node.getSourceFile().getFilePath(),
                lineNumber: node.getStartLineNumber(),
                message: `Node "${tsMorph.TypeGuards.hasName(node) ? node.getName() : node.getText()}" is not referenced in the tests`
            });
        }
    }
}
