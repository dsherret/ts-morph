import * as ts from "typescript";
import {Node} from "./../../compiler";
import {InsertionTextManipulator} from "./../textManipulators";
import {NodeHandlerFactory} from "./../nodeHandlers";
import {doManipulation} from "./../doManipulation";

export interface InsertIntoParentOptions {
    insertPos: number;
    newText: string;
    parent: Node;
    childIndex: number;
    insertItemsCount: number;
    replacing?: {
        textLength: number;
        nodes?: Node[];
    };
    customMappings?: (newParentNode: Node) => { currentNode: Node; newNode: Node; }[];
}

export function insertIntoParent(opts: InsertIntoParentOptions) {
    const {insertPos, newText, parent, childIndex, insertItemsCount, customMappings} = opts;

    doManipulation(parent.sourceFile, new InsertionTextManipulator({
        insertPos,
        newText,
        replacingLength: opts.replacing == null ? undefined : opts.replacing.textLength
    }), new NodeHandlerFactory().getForChildIndex({
        parent,
        childCount: insertItemsCount,
        childIndex,
        replacingNodes: opts.replacing == null ? undefined : opts.replacing.nodes,
        customMappings
    }));
}
