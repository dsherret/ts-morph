import {Node, SourceFile} from "./../compiler";
import {insertIntoSyntaxList} from "./insertIntoSyntaxList";

export function insertIntoCommaSeparatedNodes(sourceFile: SourceFile, currentNodes: Node[], index: number, codes: string[]) {
    const nextNode = currentNodes[index];
    const numberOfSyntaxListItemsInserting = codes.length * 2;

    if (nextNode == null) {
        const previousNode = currentNodes[index - 1];
        insertIntoSyntaxList(sourceFile, previousNode.getEnd(), `, ${codes.join(", ")}`, previousNode.getRequiredParentSyntaxList(),
            previousNode.getChildIndex() + 1, numberOfSyntaxListItemsInserting);
    }
    else {
        insertIntoSyntaxList(sourceFile, nextNode.getStart(), `${codes.join(", ")}, `, nextNode.getRequiredParentSyntaxList(),
            nextNode.getChildIndex(), numberOfSyntaxListItemsInserting);
    }
}
