/**
 * Code Verification - Ensure Classes Implement .getStructure()
 * ------------------------------------------------------------
 * This code verification ensures that for each Structure its corresponding class
 * implements getStructure method.
 * ------------------------------------------------------------
 */
import { TsSimpleAstInspector } from "../inspectors";
import { Problem } from "./Problem";

export function ensureClassesImplementGetStructure(inspector: TsSimpleAstInspector, problems: Problem[]) {
    const nodes = inspector.getWrappedNodes();
    const structures = inspector.getStructures();

    for (const structure of structures) {
        const node = nodes.find(n => n.getName() + "Structure" === structure.getName());
        if (node == null)
            continue;

        if (!node.hasMethod("getStructure"))
            problems.push({
                filePath: node.getFilePath(),
                lineNumber: node.getStartLineNumber(),
                message: `${node.getName()} does not have a .getStructure() function.`
            });
    }
}
