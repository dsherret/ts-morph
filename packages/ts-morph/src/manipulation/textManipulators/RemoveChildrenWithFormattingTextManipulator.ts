import { Node } from "../../compiler";
import { FormattingKind } from "../formatting";
import { isNewLineAtPos } from "../textChecks";
import { getPosAtEndOfPreviousLine, getPosAtNextNonBlankLine, getPosAtStartOfLineOrNonWhitespace, getPreviousNonWhitespacePos } from "../textSeek";
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
        const { children, getSiblingFormatting } = this.opts;
        const firstChild = children[0];
        const lastChild = children[children.length - 1];
        const parent = firstChild.getParentOrThrow() as TNode;
        const sourceFile = parent.getSourceFile();
        const fullText = sourceFile.getFullText();
        const newLineKind = sourceFile._context.manipulationSettings.getNewLineKindAsString();
        const previousSibling = firstChild.getPreviousSibling();
        const nextSibling = lastChild.getNextSibling();
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

            const firstPos = getPreviousNonWhitespacePos(fullText, firstChild.getPos());
            if (parent.getPos() === firstPos)
                return firstChild.getNonWhitespaceStart(); // do not shift the parent

            return firstChild.isFirstNodeOnLine() ? firstPos : firstChild.getNonWhitespaceStart();
        }

        function getRemovalEnd() {
            const triviaEnd = lastChild.getTrailingTriviaEnd();
            if (previousSibling != null && nextSibling != null) {
                const nextSiblingFormatting = getSiblingFormatting(parent as TNode, nextSibling);
                if (nextSiblingFormatting === FormattingKind.Blankline || nextSiblingFormatting === FormattingKind.Newline)
                    return getPosAtStartOfLineOrNonWhitespace(fullText, nextSibling.getNonWhitespaceStart());

                return nextSibling.getNonWhitespaceStart();
            }

            if (parent.getEnd() === lastChild.getEnd())
                return lastChild.getEnd(); // do not shift the parent

            if (isNewLineAtPos(fullText, triviaEnd)) {
                if (previousSibling == null && firstChild.getPos() === 0)
                    return getPosAtNextNonBlankLine(fullText, triviaEnd);
                return getPosAtEndOfPreviousLine(fullText, getPosAtNextNonBlankLine(fullText, triviaEnd));
            }

            if (previousSibling == null)
                return triviaEnd;
            else
                return lastChild.getEnd();
        }
    }

    getTextForError(newText: string) {
        return getTextForError(newText, this.removalPos!);
    }
}
