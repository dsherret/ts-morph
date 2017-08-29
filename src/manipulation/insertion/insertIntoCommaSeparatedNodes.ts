import * as ts from "typescript";
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
    const previousNode = currentNodes[insertIndex - 1];
    const numberOfSyntaxListItemsInserting = newTexts.length * 2 - 1;

    if (nextNode != null) {
        insertIntoCreatableSyntaxList({
            parent,
            insertPos: nextNode.getStart(),
            newText: `${newTexts.join(", ")}, `,
            syntaxList: nextNode.getParentSyntaxListOrThrow(),
            childIndex: nextNode.getChildIndex(),
            insertItemsCount: numberOfSyntaxListItemsInserting + 1 // extra comma
        });
    }
    else if (previousNode != null) {
        insertIntoCreatableSyntaxList({
            parent,
            insertPos: previousNode.getEnd(),
            newText: `, ${newTexts.join(", ")}`,
            syntaxList: previousNode.getParentSyntaxListOrThrow(),
            childIndex: previousNode.getChildIndex() + 1,
            insertItemsCount: numberOfSyntaxListItemsInserting + 1 // extra comma
        });
    }
    else {
        insertIntoCreatableSyntaxList({
            parent,
            insertPos: parent.getFirstChildByKindOrThrow(ts.SyntaxKind.SyntaxList).getPos(),
            syntaxList: parent.getFirstChildByKind(ts.SyntaxKind.SyntaxList),
            newText: newTexts.join(", "),
            childIndex: 0,
            insertItemsCount: numberOfSyntaxListItemsInserting
        });
    }
}
