import {Node} from "./../../compiler";
import {replaceTreeCreatingSyntaxList} from "./../tree";
import {getNewReplacementSourceFile} from "./getNewReplacementSourceFile";

export interface InsertSyntaxListOptions {
    insertPos: number;
    newText: string;
    parent: Node;
}

export function insertSyntaxList(opts: InsertSyntaxListOptions) {
    const {insertPos, newText, parent} = opts;
    const tempSourceFile = getNewReplacementSourceFile({
        sourceFile: parent.getSourceFile(),
        insertPos,
        newText
    });

    replaceTreeCreatingSyntaxList({
        parent,
        replacementSourceFile: tempSourceFile,
        insertPos
    });
}
