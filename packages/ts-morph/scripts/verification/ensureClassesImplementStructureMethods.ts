/**
 * Code Verification - Ensure Classes Implement Structure Methods
 * --------------------------------------------------------------
 * This code verification ensures that for each Structure its corresponding class
 * implements .getStructure and .set method.
 * --------------------------------------------------------------
 */
import { TsMorphInspector, WrappedNode } from "../inspectors";
import { Problem } from "./Problem";

export function ensureClassesImplementStructureMethods(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
    const nodes = inspector.getWrappedNodes();
    const structures = inspector.getStructures();

    for (const structure of structures) {
        const node = nodes.find(n => n.getName() + "Structure" === structure.getName());
        if (node == null)
            continue;

        checkHasMethod(node, "getStructure");
        checkHasMethod(node, "set");
    }

    function checkHasMethod(node: WrappedNode, name: string) {
        if (!node.hasMethod(name)) {
            addProblem({
                filePath: node.getFilePath(),
                lineNumber: node.getStartLineNumber(),
                message: `${node.getName()} does not have a .${name}() function.`
            });
        }
    }
}
