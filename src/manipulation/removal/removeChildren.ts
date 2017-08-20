import {Node} from "./../../compiler";
import {getPreviousMatchingPos, getNextMatchingPos} from "./../textSeek";
import {replaceTreeWithChildIndex} from "./../tree";

export interface RemoveChildrenOptions {
    children: Node[];
    removePrecedingSpaces?: boolean;
    removeFollowingSpaces?: boolean;
}

export function removeChildren(opts: RemoveChildrenOptions) {
    const {children, removePrecedingSpaces = false, removeFollowingSpaces = false} = opts;
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
        return removePrecedingSpaces ? getPreviousMatchingPos(fullText, pos, charNotSpaceOrTab) : pos;
    }

    function getRemovalEnd() {
        const end = children[children.length - 1].getEnd();
        return removeFollowingSpaces ? getNextMatchingPos(fullText, end, charNotSpaceOrTab) : end;
    }

    function charNotSpaceOrTab(char: string) {
        return char !== " " && char !== "\t";
    }
}
