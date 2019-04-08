/**
 * Code Verification - Validate Code Fences
 * ------------------------------------------------------
 * This code verification ensures that certains functions
 * are not called and if they are called that there is a
 * comment in the form `// @code-fence-allow: <reason>`
 * ------------------------------------------------------
 */
import { MethodSignature } from "ts-morph";
import { TsMorphInspector, TsInspector } from "../inspectors";
import { Problem } from "./Problem";

export function validateCodeFences(tsMorphInspector: TsMorphInspector, tsInspector: TsInspector, addProblem: (problem: Problem) => void) {
    for (const statement of getCodeFenceStatements()) {
        const leadingComments = statement.getLeadingCommentRanges();
        if (!leadingComments.some(c => /\@code\-fence\-allow\([^\)]+\)\: /.test(c.getText()))) {
            addProblem({
                filePath: statement.getSourceFile().getFilePath(),
                lineNumber: statement.getStartLineNumber(),
                message: `Found not allowed call: ${statement.getText()}` // todo: improve error message
            });
        }
    }

    function getCodeFenceStatements() {
        return [...getGetChildrenStatements()];

        function getGetChildrenStatements() {
            const getChildrenSymbol = tsInspector.getDeclarationSymbol().getExportByNameOrThrow("Node").getMemberByNameOrThrow("getChildren");
            const methodSignature = getChildrenSymbol.getValueDeclarationOrThrow() as MethodSignature;
            const srcDir = tsMorphInspector.getSrcDirectory();
            const testDir = tsMorphInspector.getTestDirectory();
            return methodSignature.findReferencesAsNodes()
                .map(n => {
                    const lineNumber = n.getStartLineNumber();
                    return n.getParentWhile(p => p.getStartLineNumber() === lineNumber);
                })
                .filter(n => srcDir.isAncestorOf(n.getSourceFile()) && !testDir.isAncestorOf(n.getSourceFile()));
        }
    }
}
