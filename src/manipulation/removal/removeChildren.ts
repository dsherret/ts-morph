import {Node} from "./../../compiler";
import {getPreviousMatchingPos, getNextMatchingPos} from "./../textSeek";
import {replaceTreeWithChildIndex} from "./../tree";

export interface RemoveChildrenOptions {
    children: Node[];
    removePrecedingSpaces?: boolean;
    removeFollowingSpaces?: boolean;
    removePrecedingNewLines?: boolean;
    removeFollowingNewLines?: boolean;
}

export function removeChildren(opts: RemoveChildrenOptions) {
    const {children, removePrecedingSpaces = false, removeFollowingSpaces = false, removePrecedingNewLines = false, removeFollowingNewLines = false} = opts;
    if (children.length === 0)
        return;

    const sourceFile = children[0].getSourceFile();
    const fullText = sourceFile.getFullText();
    const newText = getPrefix() + getSuffix();
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newText, { filePath: sourceFile.getFilePath() });

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
        const pos = children[0].getNonWhitespaceStart();
        if (removePrecedingSpaces || removePrecedingNewLines)
            return getPreviousMatchingPos(fullText, pos, getCharRemovalFunction(removePrecedingSpaces, removePrecedingNewLines));
        return pos;
    }

    function getRemovalEnd() {
        const end = children[children.length - 1].getEnd();
        if (removeFollowingSpaces || removeFollowingNewLines)
            return getNextMatchingPos(fullText, end, getCharRemovalFunction(removeFollowingSpaces, removeFollowingNewLines));
        return end;
    }

    function getCharRemovalFunction(removeSpaces: boolean, removeNewLines: boolean) {
        return (char: string) => {
            if (removeNewLines && (char === "\r" || char === "\n"))
                return false;
            if (removeSpaces && !charNotSpaceOrTab(char))
                return false;
            return true;
        };
    }

    function charNotSpaceOrTab(char: string) {
        return char !== " " && char !== "\t";
    }
}
