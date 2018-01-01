import {Node} from "./../../compiler";
import {doManipulation} from "./../doManipulation";
import {InsertionTextManipulator} from "./../textManipulators";
import {NodeHandlerFactory} from "./../nodeHandlers";

export interface InsertSyntaxListOptions {
    insertPos: number;
    newText: string;
    parent: Node;
}

export function insertSyntaxList(opts: InsertSyntaxListOptions) {
    const {insertPos, newText, parent} = opts;

    doManipulation(parent.sourceFile,
        new InsertionTextManipulator({
            insertPos,
            newText
        }), new NodeHandlerFactory().getForCreatingSyntaxList({
            parent,
            insertPos
        }));
}
