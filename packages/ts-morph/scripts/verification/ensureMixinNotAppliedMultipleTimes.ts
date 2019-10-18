/**
 * Code Verification - Ensure Mixin Not Applied Multiple Times
 * -----------------------------------------------------------
 * This code verification checks to ensure that nodes do not
 * have the same mixin applied multiple times.
 *
 * It can be a problem for a node to have the same mixin twice
 * because, for example, methods like `set` on `StatementedNode`
 * could cause the statements to be written multiple times.
 * -----------------------------------------------------------
 */
import { TsMorphInspector, WrappedNode, Mixin } from "../inspectors";
import { Problem } from "./Problem";

export function ensureMixinNotAppliedMultipleTimes(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
    for (const node of inspector.getWrappedNodes())
        findDuplicateMixins(node);

    function findDuplicateMixins(node: WrappedNode) {
        const foundMixins = new Set<string>();
        node.getMixins().forEach(inspectMixin);

        function inspectMixin(mixin: Mixin) {
            if (foundMixins.has(mixin.getName())) {
                addProblem({
                    filePath: node.getFilePath(),
                    lineNumber: node.getStartLineNumber(),
                    message: `Node ${node.getName()} has mixin ${mixin.getName()} applied multiple times.`
                });
            }
            else {
                foundMixins.add(mixin.getName());
            }

            mixin.getMixins().forEach(inspectMixin);
        }
    }
}
