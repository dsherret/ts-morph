import {Node} from "./../../compiler";
import {doManipulation} from "./../doManipulation";
import {NodeHandlerFactory} from "./../nodeHandlers";
import {InsertionTextManipulator} from "./../textManipulators";

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

    doManipulation(parent.sourceFile,
        new InsertionTextManipulator({
            insertPos,
            newText
        }), new NodeHandlerFactory().getForRange({
            parent,
            start: insertPos,
            end: insertPos + newText.length
        }));
}
