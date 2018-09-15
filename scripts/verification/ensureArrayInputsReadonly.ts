/**
 * Code Verification - Ensure Array Inputs Readonly
 * ------------------------------------------------
 * This code verification ensures the inputs for the public API
 * only accept readonly arrays.
 * ------------------------------------------------
 */
import { TypeGuards, SyntaxKind } from "ts-simple-ast";
import { TsSimpleAstInspector } from "../inspectors";
import { hasInternalDocTag } from "../common";
import { Problem } from "./Problem";

export function ensureArrayInputsReadonly(inspector: TsSimpleAstInspector, addProblem: (problem: Problem) => void) {
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
            const parameterParent = parameter.getParent();
            if (hasInternalDocTag(parameterParent))
                return;

            addProblem({
                filePath: node.getSourceFile().getFilePath(),
                lineNumber: node.getStartLineNumber(),
                message: `Found input array type (${node.getText()}).`
            });
        });
    }
}
