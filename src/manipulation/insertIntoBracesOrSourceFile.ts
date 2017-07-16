import * as ts from "typescript";
import * as errors from "./../errors";
import {SourceFile, Node, LanguageService} from "./../compiler";
import {verifyAndGetIndex} from "./verifyAndGetIndex";
import {insertIntoSyntaxList} from "./insertIntoSyntaxList";
import {isBlankLineAtPos} from "./textChecks";

export interface InsertIntoBracesOrSourceFileOptions<TStructure> {
    parent: Node;
    children: Node[];
    index: number;
    childCodes: string[];
    separator: string;
    structures?: TStructure[];
    previousBlanklineWhen?: (previousMember: Node, firstStructure: TStructure) => boolean;
    nextBlanklineWhen?: (nextMember: Node, lastStructure: TStructure) => boolean;
    separatorNewlineWhen?: (previousStructure: TStructure, nextStructure: TStructure) => boolean;
}

/**
 * Used to insert non-comma separated nodes into braces or a source file.
 */
export function insertIntoBracesOrSourceFile<TStructure = {}>(opts: InsertIntoBracesOrSourceFileOptions<TStructure>) {
    const {parent, index, childCodes, separator, children} = opts;

    const sourceFile = parent.getSourceFile();
    const insertPos = getInsertPosition(index, parent, children);
    const newLineChar = sourceFile.global.manipulationSettings.getNewLineKind();

    let newText = "";

    for (let i = 0; i < childCodes.length; i++) {
        if (i > 0) {
            newText += separator;
            if (opts.separatorNewlineWhen != null && opts.separatorNewlineWhen(opts.structures![i - 1], opts.structures![i]))
                newText += newLineChar;
        }
        newText += childCodes[i];
    }

    if (index !== 0)
        newText = separator + newText;
    else if (insertPos !== 0)
        newText = newLineChar + newText;
    else if (sourceFile.getFullWidth() > 0)
        newText = newText + separator;

    if (opts.previousBlanklineWhen != null) {
        const previousMember: Node | undefined = children[index - 1];
        const firstStructure = opts.structures![0];
        if (previousMember != null && opts.previousBlanklineWhen(previousMember, firstStructure))
            newText = newLineChar + newText;
    }

    if (opts.nextBlanklineWhen != null) {
        const nextMember: Node | undefined = children[index];
        const lastStructure = opts.structures![opts.structures!.length - 1];
        if (nextMember != null && opts.nextBlanklineWhen(nextMember, lastStructure)) {
            if (!isBlankLineAtPos(sourceFile, insertPos))
                newText = newText + newLineChar;
        }
    }

    insertIntoSyntaxList({
        insertPos,
        newText,
        syntaxList: parent.getChildSyntaxListOrThrow(),
        childIndex: index,
        insertItemsCount: childCodes.length
    });
}

function getInsertPosition(index: number, parent: Node, children: Node[]) {
    if (index === 0) {
        if (parent.isSourceFile())
            return 0;
        else {
            const parentContainer = getParentContainer(parent);
            const openBraceToken = parentContainer.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken);
            return openBraceToken.getEnd();
        }
    }

    return children[index - 1].getEnd();
}

function getParentContainer(parent: Node) {
    if (parent.isBodiedNode())
        return parent.getBody();
    if (parent.isBodyableNode())
        return parent.getBodyOrThrow();
    else
        return parent;
}
