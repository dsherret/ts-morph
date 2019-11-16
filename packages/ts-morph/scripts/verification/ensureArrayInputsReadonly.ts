/**
 * Code Verification - Ensure Array Inputs Readonly
 * ------------------------------------------------
 * This code verification ensures the inputs for the public API
 * only accept readonly arrays.
 * ------------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import { TsMorphInspector } from "../inspectors";
import { hasInternalDocTag } from "../common";
import { Problem } from "./Problem";

export function ensureArrayInputsReadonly(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
    const declarations = inspector.getPublicDeclarations();

    for (const declaration of declarations) {
        // ignore typescript declarations
        if (declaration.getSourceFile().getFilePath().endsWith("src/typescript/typescript.ts"))
            continue;

        // could be improved, but good enough for now
        declaration.forEachDescendant(node => {
            if (!tsMorph.TypeGuards.isArrayTypeNode(node))
                return;

            // ignore types not found in parameters, rest parameters, callbacks, and arrow functions
            const parameter = node.getFirstAncestorByKind(tsMorph.SyntaxKind.Parameter);
            if (parameter == null)
                return;
            const functionType = node.getFirstAncestorByKind(tsMorph.SyntaxKind.FunctionType);
            if (functionType != null
                || (node.getParent() === parameter && parameter.isRestParameter())
                || tsMorph.TypeGuards.isArrowFunction(parameter.getParent()))
            {
                return;
            }

            const parameterParent = parameter.getParent();
            if (hasInternalDocTag(parameterParent) || isNestedFunction(parameterParent))
                return;

            addProblem({
                filePath: node.getSourceFile().getFilePath(),
                lineNumber: node.getStartLineNumber(),
                message: `Found input array type (${node.getText()}).`
            });
        });
    }

    function isNestedFunction(node: tsMorph.Node) {
        if (!tsMorph.TypeGuards.isFunctionDeclaration(node))
            return false;
        return tsMorph.TypeGuards.isBlock(node.getParent());
    }
}
