import {Node} from "./../../compiler";
import {replaceTreeCreatingSyntaxList, replaceTreeWithChildIndex} from "./../tree";
import {getNewReplacementSourceFile} from "./getNewReplacementSourceFile";
import {insertSyntaxList} from "./insertSyntaxList";
import {insertIntoParent} from "./insertIntoParent";

export interface InsertIntoCreatableSyntaxListOptions {
    insertPos: number;
    newText: string;
    parent: Node;
    syntaxList: Node | undefined;
    childIndex: number;
    insertItemsCount: number;
}

export function insertIntoCreatableSyntaxList(opts: InsertIntoCreatableSyntaxListOptions) {
    const {insertPos, newText, parent, syntaxList, childIndex, insertItemsCount} = opts;

    if (syntaxList == null)
        insertSyntaxList({
            parent,
            insertPos,
            newText
        });
    else
        insertIntoParent({
            insertPos,
            newText,
            parent: syntaxList,
            insertItemsCount,
            childIndex
        });
}
