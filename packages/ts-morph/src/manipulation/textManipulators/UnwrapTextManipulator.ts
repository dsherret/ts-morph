import { errors, StringUtils, SyntaxKind } from "@ts-morph/common";
import { Node } from "../../compiler";
import { InsertionTextManipulator } from "./InsertionTextManipulator";

export class UnwrapTextManipulator extends InsertionTextManipulator {
  constructor(node: Node) {
    super({
      insertPos: node.getStart(true),
      newText: getReplacementText(node),
      replacingLength: node.getWidth(true),
    });
  }
}

function getReplacementText(node: Node) {
  const sourceFile = node._sourceFile;
  const range = getInnerBraceRange();
  const startPos = range[0];
  const text = sourceFile.getFullText().substring(range[0], range[1]);

  return StringUtils.indent(text, -1, {
    indentText: sourceFile._context.manipulationSettings.getIndentationText(),
    indentSizeInSpaces: sourceFile._context.manipulationSettings._getIndentSizeInSpaces(),
    isInStringAtPos: pos => sourceFile.isInStringAtPos(startPos + pos),
  }).trim();

  function getInnerBraceRange() {
    const bodyNode = getBodyNodeOrThrow();
    return [bodyNode.getStart() + 1, bodyNode.getEnd() - 1] as const;

    function getBodyNodeOrThrow(message?: string | (() => string)) {
      if (Node.isModuleDeclaration(node)) {
        const bodyNode = node._getInnerBody();
        if (bodyNode == null)
          throw new errors.InvalidOperationError(message || "This operation requires the module to have a body.");
        return bodyNode;
      } else if (Node.isBodied(node))
        return node.getBody();
      else if (Node.isBodyable(node))
        return node.getBodyOrThrow();
      else
        throw new errors.NotImplementedError(message || `Not implemented unwrap scenario for ${node.getKindName()}.`, node);
    }
  }
}
