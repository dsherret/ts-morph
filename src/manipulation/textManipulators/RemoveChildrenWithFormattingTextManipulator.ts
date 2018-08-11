import { Node } from "../../compiler";
import { FormattingKind } from "../formatting";
import { isNewLineAtPos } from "../textChecks";
import { getPosAtEndOfPreviousLine, getPosAtNextNonBlankLine, getPosAtStartOfLineOrNonWhitespace } from "../textSeek";
import { getSpacingBetweenNodes } from "./getSpacingBetweenNodes";
import { getTextForError } from "./getTextForError";
import { TextManipulator } from "./TextManipulator";

export interface RemoveChildrenWithFormattingTextManipulatorOptions<TNode extends Node> {
    children: Node[];
    getSiblingFormatting: (parent: TNode, sibling: Node) => FormattingKind;
}

export class RemoveChildrenWithFormattingTextManipulator<TNode extends Node> implements TextManipulator {
    private removalPos: number | undefined;

    constructor(private readonly opts: RemoveChildrenWithFormattingTextManipulatorOptions<TNode>) {
    }

    getNewText(inputText: string) {
        const {children, getSiblingFormatting} = this.opts;
        const parent = children[0].getParentOrThrow() as TNode;
        const sourceFile = parent.getSourceFile();
        const fullText = sourceFile.getFullText();
        const newLineKind = sourceFile.context.manipulationSettings.getNewLineKindAsString();
        const previousSibling = children[0].getPreviousSibling();
        const nextSibling = children[children.length - 1].getNextSibling();
        const removalPos = getRemovalPos();
        this.removalPos = removalPos;

        // console.log(JSON.stringify(fullText.substring(0, removalPos)));
        // console.log(JSON.stringify(fullText.substring(getRemovalEnd())));

        return getPrefix() + getSpacing() + getSuffix();

        function getPrefix() {
            return fullText.substring(0, removalPos);
        }

        function getSpacing() {
            return getSpacingBetweenNodes({
                parent,
                previousSibling,
                nextSibling,
                newLineKind,
                getSiblingFormatting
            });
        }

        function getSuffix() {
            return fullText.substring(getRemovalEnd());
        }

        function getRemovalPos() {
            if (previousSibling != null) {
                const trailingEnd = previousSibling.getTrailingTriviaEnd();
                return isNewLineAtPos(fullText, trailingEnd) ? trailingEnd : previousSibling.getEnd();
            }

            if (parent.getPos() === children[0].getPos())
                return children[0].getNonWhitespaceStart(); // do not shift the parent

            return children[0].isFirstNodeOnLine() ? children[0].getPos() : children[0].getNonWhitespaceStart();
        }

        function getRemovalEnd() {
            if (previousSibling != null && nextSibling != null) {
                const nextSiblingFormatting = getSiblingFormatting(parent as TNode, nextSibling);
                if (nextSiblingFormatting === FormattingKind.Blankline || nextSiblingFormatting === FormattingKind.Newline)
                    return getPosAtStartOfLineOrNonWhitespace(fullText, nextSibling.getNonWhitespaceStart());

                return nextSibling.getNonWhitespaceStart();
            }

            if (parent.getEnd() === children[children.length - 1].getEnd())
                return children[children.length - 1].getEnd(); // do not shift the parent

            const triviaEnd = children[children.length - 1].getTrailingTriviaEnd();
            if (isNewLineAtPos(fullText, triviaEnd)) {
                if (previousSibling == null && children[0].getPos() === 0)
                    return getPosAtNextNonBlankLine(fullText, triviaEnd);
                return getPosAtEndOfPreviousLine(fullText, getPosAtNextNonBlankLine(fullText, triviaEnd));
            }

            if (previousSibling == null)
                return triviaEnd;
            else
                return children[children.length - 1].getEnd();
        }
    }

    getTextForError(newText: string) {
        return getTextForError(newText, this.removalPos!);
    }
}
