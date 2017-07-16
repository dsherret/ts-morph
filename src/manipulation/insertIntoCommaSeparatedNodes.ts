import {Node, SourceFile} from "./../compiler";
import {insertIntoSyntaxList} from "./insertIntoSyntaxList";

export interface InsertIntoCommaSeparatedNodesOptions {
    currentNodes: Node[];
    insertIndex: number;
    newTexts: string[];
}

export function insertIntoCommaSeparatedNodes(opts: InsertIntoCommaSeparatedNodesOptions) {
    const {currentNodes, insertIndex, newTexts} = opts;
    const nextNode = currentNodes[insertIndex];
    const numberOfSyntaxListItemsInserting = newTexts.length * 2;

    if (nextNode == null) {
        const previousNode = currentNodes[insertIndex - 1];
        insertIntoSyntaxList({
            insertPos: previousNode.getEnd(),
            newText: `, ${newTexts.join(", ")}`,
            syntaxList: previousNode.getParentSyntaxListOrThrow(),
            childIndex: previousNode.getChildIndex() + 1,
            insertItemsCount: numberOfSyntaxListItemsInserting
        });
    }
    else {
        insertIntoSyntaxList({
            insertPos: nextNode.getStart(),
            newText: `${newTexts.join(", ")}, `,
            syntaxList: nextNode.getParentSyntaxListOrThrow(),
            childIndex: nextNode.getChildIndex(),
            insertItemsCount: numberOfSyntaxListItemsInserting
        });
    }
}
