import { Node } from "../../compiler";
import { StringUtils, TypeGuards } from "../../utils";
import { FormattingKind } from "../formatting";
import { getPosAtNextNonBlankLine } from "../textSeek";
import { getSpacingBetweenNodes } from "./getSpacingBetweenNodes";
import { TextManipulator } from "./TextManipulator";

export interface ChangingChildOrderTextManipulatorOptions<TParentNode extends Node> {
    parent: TParentNode;
    oldIndex: number;
    newIndex: number;
    getSiblingFormatting: (parent: TParentNode, sibling: Node) => FormattingKind;
}

export class ChangingChildOrderTextManipulator<TParentNode extends Node> implements TextManipulator {
    constructor(private readonly opts: ChangingChildOrderTextManipulatorOptions<TParentNode>) {
    }

    getNewText(inputText: string) {
        const {parent, oldIndex, newIndex, getSiblingFormatting} = this.opts;
        const children = parent.getChildren();
        const newLineKind = parent.context.manipulationSettings.getNewLineKindAsString();
        const movingNode = children[oldIndex];
        const fullText = parent.sourceFile.getFullText();
        const movingNodeStart = getPosAtNextNonBlankLine(fullText, movingNode.getPos());
        const movingNodeText = fullText.substring(movingNodeStart, movingNode.getEnd());
        const lowerIndex = Math.min(newIndex, oldIndex);
        const upperIndex = Math.max(newIndex, oldIndex);
        const childrenInNewOrder = getChildrenInNewOrder();
        const isParentSourceFile = TypeGuards.isSourceFile(parent.getParentOrThrow());

        let finalText = "";
        fillPrefixText();
        fillTextForIndex(lowerIndex);
        fillMiddleText();
        fillTextForIndex(upperIndex);
        fillSuffixText();
        return finalText;

        function getChildrenInNewOrder() {
            const result = [...children];
            result.splice(oldIndex, 1);
            result.splice(newIndex, 0, movingNode);
            return result;
        }

        function fillPrefixText() {
            finalText += fullText.substring(0, children[lowerIndex].getPos());

            if (lowerIndex === 0 && !isParentSourceFile)
                finalText += newLineKind;
        }

        function fillMiddleText() {
            let startPos: number;
            let endPos: number;
            if (lowerIndex === oldIndex) {
                startPos = getPosAtNextNonBlankLine(fullText, children[lowerIndex].getEnd());
                endPos = children[upperIndex].getEnd();
            }
            else {
                startPos = getPosAtNextNonBlankLine(fullText, children[lowerIndex].getPos());
                endPos = children[upperIndex].getPos();
            }
            finalText += fullText.substring(startPos, endPos);
        }

        function fillSuffixText() {
            if (children.length - 1 === upperIndex && !isParentSourceFile)
                finalText += newLineKind;
            finalText += fullText.substring(getPosAtNextNonBlankLine(fullText, children[upperIndex].getEnd()));
        }

        function fillTextForIndex(index: number) {
            if (index === oldIndex)
                fillSpacingForRemoval();
            else {
                fillSpacingBeforeInsertion();
                finalText += movingNodeText;
                fillSpacingAfterInsertion();
            }
        }

        function fillSpacingForRemoval() {
            if (oldIndex === 0 || oldIndex === children.length - 1)
                return;

            fillSpacingCommon({
                previousSibling: childrenInNewOrder[oldIndex - 1],
                nextSibling: childrenInNewOrder[oldIndex]
            });
        }

        function fillSpacingBeforeInsertion() {
            if (newIndex === 0)
                return;

            fillSpacingCommon({
                previousSibling: childrenInNewOrder[newIndex - 1],
                nextSibling: childrenInNewOrder[newIndex]
            });
        }

        function fillSpacingAfterInsertion() {
            fillSpacingCommon({
                previousSibling: childrenInNewOrder[newIndex],
                nextSibling: childrenInNewOrder[newIndex + 1]
            });
        }

        function fillSpacingCommon(spacingOpts: { previousSibling: Node; nextSibling: Node; }) {
            const spacing = getSpacingBetweenNodes({
                parent,
                getSiblingFormatting,
                newLineKind,
                previousSibling: spacingOpts.previousSibling,
                nextSibling: spacingOpts.nextSibling
            });

            const twoNewLines = newLineKind + newLineKind;
            if (spacing === twoNewLines) {
                if (StringUtils.endsWith(finalText, twoNewLines))
                    return;
                else if (StringUtils.endsWith(finalText, newLineKind))
                    finalText += newLineKind;
                else
                    finalText += twoNewLines;
            }
            else if (spacing === newLineKind) {
                if (StringUtils.endsWith(finalText, newLineKind))
                    return;
                else
                    finalText += newLineKind;
            }
            else if (spacing === " ") {
                if (StringUtils.endsWith(finalText, " "))
                    return;
                else
                    finalText += " ";
            }
            else
                finalText += spacing;
        }
    }

    getTextForError(newText: string) {
        return newText;
    }
}
