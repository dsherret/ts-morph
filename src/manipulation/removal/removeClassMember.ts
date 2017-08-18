import {Node, ClassDeclaration, OverloadableNode} from "./../../compiler";
import {getClassMemberFormatting, FormattingKind} from "./../formatting";
import {getPosAtNextNonBlankLine} from "./../textSeek";
import {replaceTreeWithChildIndex} from "./../tree";

export function removeOverloadableClassMember(parent: ClassDeclaration, classMember: Node & OverloadableNode) {
    if (classMember.isOverload())
        removeClassMember(parent, classMember);
    else
        removeClassMembers(parent, [...classMember.getOverloads(), classMember]);
}

export function removeClassMember(parent: ClassDeclaration, classMember: Node) {
    removeClassMembers(parent, [classMember]);
}

export function removeClassMembers(parent: ClassDeclaration, classMembers: Node[]) {
    const sourceFile = parent.getSourceFile();
    const fullText = sourceFile.getFullText();
    const newLineKind = sourceFile.global.manipulationSettings.getNewLineKind();
    const previousSibling = classMembers[0].getPreviousSibling();
    const nextSibling = classMembers[classMembers.length - 1].getNextSibling();
    const newText = getPrefix() + getSpacing() + getSuffix();
    const tempSourceFile = sourceFile.global.compilerFactory.createTempSourceFileFromText(newText, sourceFile.getFilePath());

    replaceTreeWithChildIndex({
        replacementSourceFile: tempSourceFile,
        parent: classMembers[0].getParentSyntaxListOrThrow(),
        childIndex: classMembers[0].getChildIndex(),
        childCount: -1 * classMembers.length
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
        return previousSibling == null ? classMembers[0].getPos() : previousSibling.getEnd();
    }

    function getRemovalEnd() {
        return nextSibling == null ? getPosAtNextNonBlankLine(fullText, classMembers[classMembers.length - 1].getEnd()) : nextSibling.getStartLinePos();
    }
}
