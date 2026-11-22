import { SyntaxKind, ts } from "@ts-morph/common";
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
  const parameterText = parameter.getText();
  insertIntoParentTextRange({
    parent: node,
    insertPos: parameter.getStart(),
    newText: getNewText(parameterText),
    replacing: { textLength: parameterText.length },
    customMappings: newParent => {
      const newParameters = (newParent as ts.ArrowFunction).parameters;
      const newParameter = newParameters[isLastParameter ? newParameters.length - 1 : 0];
      return [
        { currentNode: parameter, newNode: newParameter },
        { currentNode: name, newNode: newParameter.name },
      ];
    },
  });
  return true;
}
