import {Node} from "./../../compiler";
import {replaceTreeWithRange} from "./../tree";
import {getNewReplacementSourceFile} from "./../getNewReplacementSourceFile";

export interface InsertIntoParentTextRangeOptions {
    insertPos: number;
    newText: string;
    parent: Node;
}

/**
 * Inserts a text range into a parent.
 */
export function insertIntoParentTextRange(opts: InsertIntoParentTextRangeOptions) {
    const {insertPos, newText, parent} = opts;
    const tempSourceFile = getNewReplacementSourceFile({
        sourceFile: parent.getSourceFile(),
        insertPos,
        newText
    });

    replaceTreeWithRange({
        parent,
        replacementSourceFile: tempSourceFile,
        start: insertPos,
        end: insertPos + newText.length
    });
}
