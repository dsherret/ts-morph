/**
 * Code Verification - Ensure Array Inputs Readonly
 * ------------------------------------------------
 * This code verification ensures the inputs for the public API
 * only accept readonly arrays.
 * ------------------------------------------------
 */
import { tsMorph } from "../../../scripts/mod.ts";
import { hasInternalDocTag } from "../common/mod.ts";
import { TsMorphInspector } from "../inspectors/mod.ts";
import { Problem } from "./Problem.ts";

export function ensureArrayInputsReadonly(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
  const declarations = inspector.getPublicDeclarations();

  for (const declaration of declarations) {
    // ignore typescript declarations
    if (declaration.getSourceFile().getFilePath().endsWith("src/typescript/typescript.ts"))
      continue;

    // could be improved, but good enough for now
    declaration.forEachDescendant(node => {
      if (!tsMorph.Node.isArrayTypeNode(node))
        return;

      // ignore types not found in parameters, rest parameters, callbacks, and arrow functions
      const parameter = node.getFirstAncestorByKind(tsMorph.SyntaxKind.Parameter);
      if (parameter == null)
        return;
      const functionType = node.getFirstAncestorByKind(tsMorph.SyntaxKind.FunctionType);
      if (
        functionType != null
        || (node.getParent() === parameter && parameter.isRestParameter())
        || tsMorph.Node.isArrowFunction(parameter.getParent())
      ) {
        return;
      }

      const parameterParent = parameter.getParent();
      if (hasInternalDocTag(parameterParent) || isNestedFunction(parameterParent))
        return;

      addProblem({
        filePath: node.getSourceFile().getFilePath(),
        lineNumber: node.getStartLineNumber(),
        message: `Found input array type (${node.getText()}).`,
      });
    });
  }

  function isNestedFunction(node: tsMorph.Node) {
    if (!tsMorph.Node.isFunctionDeclaration(node))
      return false;
    return tsMorph.Node.isBlock(node.getParent());
  }
}
