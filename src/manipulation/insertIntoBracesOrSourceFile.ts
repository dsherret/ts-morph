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

    insertIntoSyntaxList(sourceFile, insertPos, code, parent.getRequiredChildSyntaxList(sourceFile), index, childCodes.length);
}

function getInsertPosition(sourceFile: SourceFile, index: number, parent: Node, children: Node[]) {
    if (index === 0) {
        if (parent.isSourceFile())
            return 0;
        else {
            const parentContainer = parent.isFunctionDeclaration() || parent.isNamespaceDeclaration() ? parent.getBody() : parent;
            const openBraceToken = parentContainer.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken, sourceFile);
            if (openBraceToken == null)
                throw new errors.NotImplementedError("Unexpected! Could not find parent's OpenBraceToken.");

            return openBraceToken!.getEnd();
        }
    }

    return children[index - 1].getEnd();
}
