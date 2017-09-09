import {Node} from "./../../compiler";
import {FormattingKind, getFormattingKindText} from "./../formatting";
import {getPosAtNextNonBlankLine, getNextMatchingPos, getPosAfterPreviousNonBlankLine} from "./../textSeek";
import {replaceTreeWithChildIndex} from "./../tree";

export interface RemoveChildrenWithFormattingOptions<TNode extends Node> {
    children: Node[];
    getSiblingFormatting: (parent: TNode, sibling: Node) => FormattingKind;
}

export function removeChildrenWithFormattingFromCollapsibleSyntaxList<TNode extends Node>(opts: RemoveChildrenWithFormattingOptions<TNode>) {
    const {children} = opts;
    if (children.length === 0)
        return;

    const syntaxList = children[0].getParentSyntaxListOrThrow();
    if (syntaxList.getChildCount() === children.length) {
        removeChildrenWithFormatting({
            children: [syntaxList],
            getSiblingFormatting: () => FormattingKind.None
        });
    }
    else
        removeChildrenWithFormatting(opts);
}

export function removeChildrenWithFormatting<TNode extends Node>(opts: RemoveChildrenWithFormattingOptions<TNode>) {
    const {children, getSiblingFormatting} = opts;
    if (children.length === 0)
        return;

    const parent = children[0].getParentOrThrow();
    const sourceFile = parent.getSourceFile();
    const fullText = sourceFile.getFullText();
    const newLineKind = sourceFile.global.manipulationSettings.getNewLineKind();
    const previousSibling = children[0].getPreviousSibling();
    const nextSibling = children[children.length - 1].getNextSibling();
    const newText = getPrefix() + getSpacing() + getSuffix();
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newText, sourceFile.getFilePath());

    replaceTreeWithChildIndex({
        replacementSourceFile: tempSourceFile,
        parent: children[0].getParentSyntaxList() || children[0].getParentOrThrow(),
        childIndex: children[0].getChildIndex(),
        childCount: -1 * children.length
    });

    function getPrefix() {
        return fullText.substring(0, getRemovalPos());
    }

    function getSpacing() {
        if (previousSibling != null && nextSibling != null) {
            const previousSiblingFormatting = getSiblingFormatting(parent as TNode, previousSibling);
            const nextSiblingFormatting = getSiblingFormatting(parent as TNode, nextSibling);

            if (previousSiblingFormatting === FormattingKind.Blankline || nextSiblingFormatting === FormattingKind.Blankline)
                return newLineKind + newLineKind;
            else if (previousSiblingFormatting === FormattingKind.Newline || nextSiblingFormatting === FormattingKind.Newline)
                return newLineKind;
            else if (previousSiblingFormatting === FormattingKind.Space || nextSiblingFormatting === FormattingKind.Space)
                return " ";
        }
        return "";
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
                const nextSiblingStartLinePos = nextSibling.getStartLinePos();
                if (nextSiblingStartLinePos !== children[children.length - 1].getStartLinePos())
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
