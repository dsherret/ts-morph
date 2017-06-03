import * as ts from "typescript";
import * as errors from "./../errors";
import {SourceFile, Node, LanguageService} from "./../compiler";
import {verifyAndGetIndex} from "./verifyAndGetIndex";
import {insertIntoSyntaxList} from "./insertIntoSyntaxList";

export interface InsertIntoBracesOrSourceFileOptions {
    languageService: LanguageService;
    sourceFile: SourceFile;
    parent: Node;
    children: Node[];
    index: number;
    childCodes: string[];
    separator: string;
    previousNewlineWhen?: (previousMember: Node) => boolean;
    nextNewlineWhen?: (nextMember: Node) => boolean;
}

/**
 * Used to insert non-comma separated nodes into braces or a source file.
 */
export function insertIntoBracesOrSourceFile(opts: InsertIntoBracesOrSourceFileOptions) {
    const {languageService, sourceFile, parent, index, childCodes, separator, children} = opts;

    const insertPos = getInsertPosition(sourceFile, index, parent, children);

    let code = childCodes.join(separator);
    if (index !== 0)
        code = separator + code;
    else if (insertPos !== 0)
        code = languageService.getNewLine() + code;
    else if (sourceFile.getFullWidth() > 0)
        code = code + separator;

    if (opts.previousNewlineWhen instanceof Function) {
        const previousMember: Node | undefined = children[index - 1];
        if (previousMember != null && opts.previousNewlineWhen(previousMember))
            code = languageService.getNewLine() + code;
    }
    if (opts.nextNewlineWhen instanceof Function) {
        const nextMember: Node | undefined = children[index];
        if (nextMember != null && opts.nextNewlineWhen(nextMember))
            code = code + languageService.getNewLine();
    }

    insertIntoSyntaxList(sourceFile, insertPos, code, parent.getChildSyntaxListOrThrow(sourceFile), index, childCodes.length);
}

function getInsertPosition(sourceFile: SourceFile, index: number, parent: Node, children: Node[]) {
    if (index === 0) {
        if (parent.isSourceFile())
            return 0;
        else {
            const parentContainer = getParentContainer(parent);
            const openBraceToken = parentContainer.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken, sourceFile);
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
