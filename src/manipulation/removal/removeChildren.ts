import {Node} from "./../../compiler";
import {FormattingKind, getFormattingKindText} from "./../formatting";
import {getPosAtNextNonBlankLine, getPreviousMatchingPos, getNextMatchingPos, getPosAfterPreviousNonBlankLine} from "./../textSeek";
import {replaceTreeWithChildIndex} from "./../tree";

export interface RemoveChildrenOptions<TNode extends Node> {
    children: Node[];
    removePrecedingSpaces?: boolean;
}

export function removeChildren<TNode extends Node>(opts: RemoveChildrenOptions<TNode>) {
    const {children, removePrecedingSpaces = false} = opts;
    if (children.length === 0)
        return;

    const sourceFile = children[0].getSourceFile();
    const fullText = sourceFile.getFullText();
    const newText = getPrefix() + getSuffix();
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

    function getSuffix() {
        return fullText.substring(getRemovalEnd());
    }

    function getRemovalPos() {
        const pos = children[0].getStart();
        return removePrecedingSpaces ? getPreviousMatchingPos(fullText, pos, char => char !== " " && char !== "\t") : pos;
    }

    function getRemovalEnd() {
        return children[children.length - 1].getEnd();
    }
}
