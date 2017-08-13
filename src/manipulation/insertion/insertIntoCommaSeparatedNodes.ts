import {Node, SourceFile} from "./../../compiler";
import {insertIntoCreatableSyntaxList} from "./insertIntoCreatableSyntaxList";

export interface InsertIntoCommaSeparatedNodesOptions {
    currentNodes: Node[];
    insertIndex: number;
    newTexts: string[];
    parent: Node;
}

export function insertIntoCommaSeparatedNodes(opts: InsertIntoCommaSeparatedNodesOptions) {
    const {currentNodes, insertIndex, newTexts, parent} = opts;
    const nextNode = currentNodes[insertIndex];
    const numberOfSyntaxListItemsInserting = newTexts.length * 2;

    if (nextNode == null) {
        const previousNode = currentNodes[insertIndex - 1];
        insertIntoCreatableSyntaxList({
            parent,
            insertPos: previousNode.getEnd(),
            newText: `, ${newTexts.join(", ")}`,
            syntaxList: previousNode.getParentSyntaxListOrThrow(),
            childIndex: previousNode.getChildIndex() + 1,
            insertItemsCount: numberOfSyntaxListItemsInserting
        });
    }
    else {
        insertIntoCreatableSyntaxList({
            parent,
            insertPos: nextNode.getStart(),
            newText: `${newTexts.join(", ")}, `,
            syntaxList: nextNode.getParentSyntaxListOrThrow(),
            childIndex: nextNode.getChildIndex(),
            insertItemsCount: numberOfSyntaxListItemsInserting
        });
    }
}
