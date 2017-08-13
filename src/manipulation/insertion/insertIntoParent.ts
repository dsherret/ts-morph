import {Node} from "./../../compiler";
import {replaceTreeWithChildIndex} from "./../tree";
import {getNewReplacementSourceFile} from "./getNewReplacementSourceFile";

export interface InsertIntoParentOptions {
    insertPos: number;
    newText: string;
    parent: Node;
    childIndex: number;
    insertItemsCount: number;
}

export function insertIntoParent(opts: InsertIntoParentOptions) {
    const {insertPos, newText, parent, childIndex, insertItemsCount} = opts;
    const tempSourceFile = getNewReplacementSourceFile({
        sourceFile: parent.getSourceFile(),
        insertPos,
        newText
    });

    replaceTreeWithChildIndex({
        parent,
        childCount: insertItemsCount,
        childIndex,
        replacementSourceFile: tempSourceFile
    });
}
