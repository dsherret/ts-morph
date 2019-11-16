/**
 * Code Verification - Validate CompilerNodeToWrappedType
 * ------------------------------------------------------
 * This code verification validates that the CompilerNodeToWrappedType
 * type alias properly converts the passed in compiler node type to a
 * wrapped node type.
 * ------------------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import { TsMorphInspector } from "../inspectors";
import { Problem } from "./Problem";

export function validateCompilerNodeToWrappedType(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
    const wrappedNodes = inspector.getWrappedNodes();
    const sourceFile = inspector.getProject().getSourceFileOrThrow("CompilerNodeToWrappedType.ts");
    const initialText = sourceFile.getFullText();

    try {
        const structures: tsMorph.TypeAliasDeclarationStructure[] = [];
        for (let i = 0; i < wrappedNodes.length; i++) {
            const wrapper = wrappedNodes[i];
            const nodes = wrapper.getAssociatedTsNodes();
            if (nodes.length === 0)
                continue;

            structures.push({
                kind: tsMorph.StructureKind.TypeAlias,
                name: `${wrapper.getName()}_test`,
                type: `CompilerNodeToWrappedType<${nodes[0].isTsMorphTsNode() ? "" : "ts."}${nodes[0].getNameForType()}>`
            });
        }

        const addedNodes = sourceFile.addTypeAliases(structures);
        const diagnostics = sourceFile.getPreEmitDiagnostics();

        if (diagnostics.length > 0) {
            console.log(inspector.getProject().formatDiagnosticsWithColorAndContext(diagnostics));
            throw new Error("Stopping -- Compile errors in validation.");
        }

        for (const addedNode of addedNodes) {
            const typeText = addedNode.getType().getText(addedNode).replace(/\<.*\>$/, "");
            const nodeText = "compiler." + addedNode.getName().replace("_test", "");
            if (typeText !== nodeText) {
                addProblem({
                    filePath: sourceFile.getFilePath(),
                    lineNumber: sourceFile.getTypeAliasOrThrow("CompilerNodeToWrappedType").getStartLineNumber(),
                    message: `Could not get wrapped type from node "${nodeText.replace("compiler.", "")}". Got "${typeText}".`
                });
            }
        }
    } finally {
        sourceFile.replaceWithText(initialText);
    }
}
