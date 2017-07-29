import {Node, ClassDeclaration} from "./../../compiler";
import {getClassMemberFormatting, FormattingKind} from "./../formatting";
import {getPosAtNextNonBlankLine} from "./../textSeek";
import {replaceTreeWithChildIndex} from "./../tree";

export function removeClassMember(parent: ClassDeclaration, classMember: Node) {
    const sourceFile = parent.getSourceFile();
    const fullText = sourceFile.getFullText();
    const newLineKind = sourceFile.global.manipulationSettings.getNewLineKind();
    const previousSibling = classMember.getPreviousSibling();
    const nextSibling = classMember.getNextSibling();
    const newText = getPrefix() + getSpacing() + getSuffix();
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newText, sourceFile.getFilePath());

    replaceTreeWithChildIndex({
        replacementSourceFile: tempSourceFile,
        parent: classMember.getParentSyntaxListOrThrow(),
        childIndex: classMember.getChildIndex(),
        childCount: -1
    });

    function getPrefix() {
        return fullText.substring(0, getRemovalPos());
    }

    function getSpacing() {
        let spacingText = newLineKind as string;
        if (previousSibling != null && nextSibling != null && (siblingRequiresBlankLine(previousSibling) || siblingRequiresBlankLine(nextSibling)))
            spacingText += newLineKind;
        return spacingText;
    }

    function getSuffix() {
        return fullText.substring(getRemovalEnd());
    }

    function siblingRequiresBlankLine(sibling: Node | undefined) {
        return sibling != null && getClassMemberFormatting(parent, sibling) === FormattingKind.Blankline;
    }

    function getRemovalPos() {
        return previousSibling == null ? classMember.getPos() : previousSibling.getEnd();
    }

    function getRemovalEnd() {
        return nextSibling == null ? getPosAtNextNonBlankLine(fullText, classMember.getEnd()) : nextSibling.getStartLinePos();
    }
}
