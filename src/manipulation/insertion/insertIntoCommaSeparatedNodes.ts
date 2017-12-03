import * as ts from "typescript";
import {Node, SyntaxList, SourceFile} from "./../../compiler";
import {insertIntoParent} from "./insertIntoParent";

export interface InsertIntoCommaSeparatedNodesOptions {
    currentNodes: Node[];
    insertIndex: number;
    newTexts: string[];
    parent: Node;
    useNewlines?: boolean;
}

export function insertIntoCommaSeparatedNodes(opts: InsertIntoCommaSeparatedNodesOptions) {
    // todo: this needs to be fixed/cleaned up in the future, but this is good enough for now
    const {currentNodes, insertIndex, newTexts, parent} = opts;
    const nextNode = currentNodes[insertIndex];
    const previousNode = currentNodes[insertIndex - 1];
    const numberOfSyntaxListItemsInserting = newTexts.length * 2 - 1;
    const separator = getSeparator();
    let newText = newTexts.join(`,${opts.useNewlines ? parent.global.manipulationSettings.getNewLineKind() : " "}`).replace(/^\s+/, "");

    if (nextNode != null) {
        insertIntoParent({
            insertPos: nextNode.getStart(),
            newText: `${newText},${separator}`,
            parent,
            childIndex: nextNode.getChildIndex(),
            insertItemsCount: numberOfSyntaxListItemsInserting + 1 // extra comma
        });
    }
    else if (previousNode != null) {
        insertIntoParent({
            insertPos: previousNode.getEnd(),
            newText: `,${separator}${newText}`,
            parent,
            childIndex: previousNode.getChildIndex() + 1,
            insertItemsCount: numberOfSyntaxListItemsInserting + 1 // extra comma
        });
    }
    else {
        if (opts.useNewlines && currentNodes.length === 0)
            newText = separator + newText + parent.global.manipulationSettings.getNewLineKind();

        insertIntoParent({
            insertPos: parent.getPos(),
            parent,
            newText,
            childIndex: 0,
            insertItemsCount: numberOfSyntaxListItemsInserting,
            replacing: currentNodes.length === 0 ? { textLength: parent.getNextSiblingOrThrow().getStart() - parent.getPos(), nodes: [] } : undefined
        });
    }

    function getSeparator() {
        if (!opts.useNewlines)
            return " ";

        return parent.global.manipulationSettings.getNewLineKind() + parent.getParentOrThrow().getChildIndentationText();
    }
}
