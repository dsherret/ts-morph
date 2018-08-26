/**
 * Code Verification - Ensure Array Inputs Readonly
 * ------------------------------------------------
 * This code verification ensures the
 * ------------------------------------------------
 */
import { TypeGuards, SyntaxKind } from "ts-simple-ast";
import { TsSimpleAstInspector } from "../inspectors";
import { Problem } from "./Problem";

export function ensureArrayInputsReadonly(inspector: TsSimpleAstInspector, problems: Problem[]) {
    const declarations = inspector.getPublicDeclarations();

    for (const declaration of declarations) {
        // ignore typescript declarations
        if (declaration.getSourceFile().getFilePath().endsWith("src/typescript/typescript.ts"))
            continue;

        // could be improved, but good enough for now
        declaration.forEachDescendant((node, traversal) => {
            if (!TypeGuards.isArrayTypeNode(node))
                return;

            // ignore types not found in parameters, rest parameters, callbacks, and arrow functions
            const parameter = node.getFirstAncestorByKind(SyntaxKind.Parameter);
            const functionType = node.getFirstAncestorByKind(SyntaxKind.FunctionType);
            if (parameter == null || functionType != null || (node.getParent() === parameter && parameter.isRestParameter())
                || TypeGuards.isArrowFunction(parameter.getParent()))
                return;

            problems.push({
                filePath: node.getSourceFile().getFilePath(),
                lineNumber: node.getStartLineNumber(),
                message: `Found input array type (${node.getText()}).`
            });
        });
    }
}
