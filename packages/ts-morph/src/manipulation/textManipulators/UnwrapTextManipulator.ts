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
        const bodyNode = getBodyNode();
        return [bodyNode.getStart() + 1, bodyNode.getEnd() - 1] as const;

        function getBodyNode() {
            if (Node.isNamespaceDeclaration(node))
                return node._getInnerBody();
            else if (Node.isBodiedNode(node))
                return node.getBody();
            else if (Node.isBodyableNode(node))
                return node.getBodyOrThrow();
            else
                throw new errors.NotImplementedError(`Not implemented unwrap scenario for ${node.getKindName()}.`);
        }
    }
}
