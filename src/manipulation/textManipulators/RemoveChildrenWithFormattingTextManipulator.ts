import {TextManipulator} from "./TextManipulator";
import {Node} from "./../../compiler";
import {FormattingKind, getFormattingKindText} from "./../formatting";
import {getPosAtNextNonBlankLine, getNextMatchingPos, getPosAfterPreviousNonBlankLine} from "./../textSeek";
import {getSpacingBetweenNodes} from "./getSpacingBetweenNodes";
import {getTextForError} from "./getTextForError";

export interface RemoveChildrenWithFormattingTextManipulatorOptions<TNode extends Node> {
    children: Node[];
    getSiblingFormatting: (parent: TNode, sibling: Node) => FormattingKind;
}

export class RemoveChildrenWithFormattingTextManipulator<TNode extends Node> implements TextManipulator {
    private removalPos: number;

    constructor(private readonly opts: RemoveChildrenWithFormattingTextManipulatorOptions<TNode>) {
    }

    getNewText(inputText: string) {
        const {children, getSiblingFormatting} = this.opts;
        const parent = children[0].getParentOrThrow() as TNode;
        const sourceFile = parent.getSourceFile();
        const fullText = sourceFile.getFullText();
        const newLineKind = sourceFile.global.manipulationSettings.getNewLineKind();
        const previousSibling = children[0].getPreviousSibling();
        const nextSibling = children[children.length - 1].getNextSibling();
        const removalPos = getRemovalPos();
        this.removalPos = removalPos;

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
            if (previousSibling != null && nextSibling != null)
                return previousSibling.getEnd();

            if (parent.getPos() === children[0].getPos())
                return children[0].getNonWhitespaceStart(); // do not shift the parent

            return children[0].isFirstNodeOnLine() ? getPosAfterPreviousNonBlankLine(fullText, children[0].getNonWhitespaceStart()) : children[0].getNonWhitespaceStart();
        }

        function getRemovalEnd() {
            if (previousSibling != null && nextSibling != null) {
                const nextSiblingFormatting = getSiblingFormatting(parent as TNode, nextSibling);
                if (nextSiblingFormatting === FormattingKind.Blankline || nextSiblingFormatting === FormattingKind.Newline) {
                    const nextSiblingStartLinePos = nextSibling.getStartLinePos(true);
                    if (nextSiblingStartLinePos !== children[children.length - 1].getStartLinePos(true))
                        return nextSiblingStartLinePos;
                }

                return nextSibling.getStart();
            }

            if (parent.getEnd() === children[children.length - 1].getEnd())
                return children[children.length - 1].getEnd(); // do not shift the parent

            const nextNonSpaceOrTabChar = getNextMatchingPos(fullText, children[children.length - 1].getEnd(), char => char !== " " && char !== "\t");
            if (fullText[nextNonSpaceOrTabChar] === "\r" || fullText[nextNonSpaceOrTabChar] === "\n")
                return getPosAtNextNonBlankLine(fullText, nextNonSpaceOrTabChar);
            return nextNonSpaceOrTabChar;
        }
    }

    getTextForError(newText: string) {
        return getTextForError(newText, this.removalPos);
    }
}
