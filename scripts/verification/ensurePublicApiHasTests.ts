/**
 * Code Verification - Ensure Public API Has Tests
 * -----------------------------------------------
 * This code verification checks that all methods and properties
 * in the public api appear in the tests.
 * -----------------------------------------------
 */
import { TypeGuards, Node, ReferenceFindableNode, Scope } from "ts-simple-ast";
import { TsSimpleAstInspector } from "../inspectors";
import { hasInternalDocTag } from "../common";
import { Problem } from "./Problem";

export function ensurePublicApiHasTests(inspector: TsSimpleAstInspector, addProblem: (problem: Problem) => void) {
    const nodes: (Node & ReferenceFindableNode)[] = [];

    for (const dec of [...inspector.getPublicClasses(), ...inspector.getPublicInterfaces()]) {
        const filePath = dec.getSourceFile().getFilePath();
        // ignore paths that don't need testing
        if (filePath.endsWith("src/typescript/typescript.ts")
            || filePath.endsWith("src/utils/TypeGuards.ts")
            || filePath.endsWith("src/compiler/kindToNodeMappings.ts")
            || filePath.endsWith("src/codeBlockWriter/code-block-writer.ts"))
            continue;

        for (const node of [...dec.getMethods(), ...dec.getProperties()]) {
            if (TypeGuards.isScopedNode(node) && node.getScope() !== Scope.Public)
                continue;
            if (hasInternalDocTag(node))
                continue;
            nodes.push(node);
        }
    }

    for (const node of nodes) {
        const referencingNodes = node.findReferencesAsNodes();
        const testsReference = referencingNodes.some(n => n.getSourceFile().getFilePath().includes("/src/tests"));

        if (!testsReference)
            addProblem({
                filePath: node.getSourceFile().getFilePath(),
                lineNumber: node.getStartLineNumber(),
                message: `Node "${TypeGuards.hasName(node) ? node.getName() : node.getText()}" is not referenced in the tests`
            });
    }
}
