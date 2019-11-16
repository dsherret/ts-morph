/**
 * Code Verification - Validate Code Fences
 * ------------------------------------------------------
 * This code verification ensures that certains objects
 * are not referenced and if they are then there must be a
 * comment in the form `// @code-fence-allow(name): <reason>`
 * ------------------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import { TsMorphInspector, TsInspector } from "../inspectors";
import { Problem } from "./Problem";

export function validateCodeFences(
    tsMorphInspector: TsMorphInspector,
    tsInspector: TsInspector,
    addProblem: (problem: Problem) => void
) {
    for (const disallowedReferenceNode of getDisallowedReferenceNodes()) {
        const leadingComments = getLeadingCommentRanges(disallowedReferenceNode);
        const allowSearchString = `@code-fence-allow(${disallowedReferenceNode.getText()}): `;
        if (!leadingComments.some(c => c.getText().indexOf(allowSearchString) >= 0)) {
            addProblem({
                filePath: disallowedReferenceNode.getSourceFile().getFilePath(),
                lineNumber: disallowedReferenceNode.getStartLineNumber(),
                message: `Found not allowed reference \`${disallowedReferenceNode.getText()}\``
            });
        }
    }

    function getDisallowedReferenceNodes() {
        const srcDir = tsMorphInspector.getSrcDirectory();
        const testDir = tsMorphInspector.getTestDirectory();

        // limit to the references in the src folder and ignore the test folder
        return [...forGetChildren()]
            .filter(n => srcDir.isAncestorOf(n.getSourceFile())
                && !testDir.isAncestorOf(n.getSourceFile()));

        // todo: add more functions here in the future
        function forGetChildren() {
            const getChildrenSymbol = tsInspector
                .getTsSymbol()
                .getExportOrThrow("Node")
                .getMemberOrThrow("getChildren");

            // wish it were possible to get the references from a symbol
            const methodSignature = getChildrenSymbol.getValueDeclarationOrThrow() as tsMorph.MethodSignature;
            return methodSignature.findReferencesAsNodes();
        }
    }

    function getLeadingCommentRanges(node: tsMorph.Node) {
        return getTopMostNodeOnSameLine().getLeadingCommentRanges();

        function getTopMostNodeOnSameLine() {
            const referenceLineNumber = node.getStartLineNumber();
            return node.getParentWhile(p => p.getStartLineNumber() === referenceLineNumber) || node;
        }
    }
}
