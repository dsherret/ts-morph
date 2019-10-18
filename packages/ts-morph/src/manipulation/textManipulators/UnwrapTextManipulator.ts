import { StringUtils } from "@ts-morph/common";
import { Node } from "../../compiler";
import { InsertionTextManipulator } from "./InsertionTextManipulator";

export class UnwrapTextManipulator extends InsertionTextManipulator {
    constructor(node: Node) {
        super({
            insertPos: node.getStart(true),
            newText: getReplacementText(node),
            replacingLength: node.getWidth(true)
        });
    }
}

function getReplacementText(node: Node) {
    const childSyntaxList = node.getChildSyntaxListOrThrow();
    const sourceFile = node._sourceFile;
    const startPos = childSyntaxList.getPos();

    return StringUtils.indent(childSyntaxList.getFullText(), -1, {
        indentText: sourceFile._context.manipulationSettings.getIndentationText(),
        indentSizeInSpaces: sourceFile._context.manipulationSettings._getIndentSizeInSpaces(),
        isInStringAtPos: pos => sourceFile.isInStringAtPos(startPos + pos)
    }).trimLeft();
}
