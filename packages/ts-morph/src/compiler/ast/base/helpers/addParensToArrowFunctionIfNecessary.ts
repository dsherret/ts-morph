import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange } from "../../../../manipulation";
import { Node } from "../../common/Node";

export interface AddParensToArrowFunctionOptions {
  /** Gets the text to replace the parameter with. Must include the parentheses. */
  getNewText?: (parameterText: string) => string;
  /** Whether the existing parameter will be the last one in the new text instead of the first. */
  isLastParameter?: boolean;
}

/**
 * Wraps the parameter of an arrow function in parentheses when it has none (ex. `x => x`).
 *
 * This is done in a single manipulation with any provided text so a failure leaves the text unchanged.
 * @param node - Node to add the parentheses to when it's an arrow function without them.
 * @param opts - Options for the text to insert.
 * @returns True when the parentheses were added.
 */
export function addParensToArrowFunctionIfNecessary(node: Node, opts: AddParensToArrowFunctionOptions = {}) {
  if (!Node.isArrowFunction(node) || node.getFirstChildByKind(SyntaxKind.OpenParenToken) != null)
    return false;

  const { getNewText = (text: string) => `(${text})`, isLastParameter = false } = opts;
  const parameter = node.getParameters()[0];
  const name = parameter.getNameNode();
  const syntaxList = parameter.getParentSyntaxListOrThrow();
  const parameterText = parameter.getText();
  const insertPos = parameter.getStart();
  const newText = getNewText(parameterText);
  insertIntoParentTextRange({
    parent: node,
    insertPos,
    newText,
    replacing: { textLength: parameterText.length },
    customMappings: (newParent, newSourceFile) => {
      const newArrowFunction = newParent as ts.ArrowFunction;
      const newParameters = newArrowFunction.parameters;
      const newParameter = newParameters[isLastParameter ? newParameters.length - 1 : 0];
      // mappings can't be undone, so verify the inserted text didn't change the arrow function's shape first
      if (
        newArrowFunction.equalsGreaterThanToken.getStart(newSourceFile) < insertPos + newText.length
        || newParameter?.getText(newSourceFile) !== parameterText
      ) {
        throw new errors.InvalidOperationError("The inserted text changed the structure of the arrow function.");
      }
      return [
        { currentNode: syntaxList, newNode: getParameterSyntaxList(newParent, newSourceFile) },
        { currentNode: parameter, newNode: newParameter },
        { currentNode: name, newNode: newParameter.name },
      ];
    },
  });
  return true;
}

function getParameterSyntaxList(arrowFunction: ts.Node, sourceFile: ts.SourceFile) {
  const children = arrowFunction.getChildren(sourceFile);
  // the modifiers and type parameters have their own syntax lists, so find the one after the paren
  return children[children.findIndex(child => child.kind === SyntaxKind.OpenParenToken) + 1];
}
