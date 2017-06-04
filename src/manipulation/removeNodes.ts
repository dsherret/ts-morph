import * as ts from "typescript";
import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";

// todo: remove and replace this...

export interface RemoveNodesOptions {
    removePrecedingSpaces?: boolean;
}

export function removeNodes(sourceFile: SourceFile, nodes: (Node | undefined)[], opts: RemoveNodesOptions = {}) {
    const nonNullNodes = nodes.filter(n => n != null) as Node[];
    if (nonNullNodes.length === 0 || nonNullNodes[0].getPos() === nonNullNodes[nonNullNodes.length - 1].getEnd())
        return;
    ensureNodePositionsContiguous(nonNullNodes);

    // get the start and end position
    const {removePrecedingSpaces = true} = opts;
    const parentStart = nonNullNodes[0].getParentOrThrow().getStart(sourceFile);
    const nodeStart = nonNullNodes[0].getStart(sourceFile);
    const currentText = sourceFile.getFullText();
    const removeRangeStart = removePrecedingSpaces ? Math.max(parentStart, nonNullNodes[0].getPos()) : nodeStart;
    let removeRangeEnd = nonNullNodes[nonNullNodes.length - 1].getEnd();

    // trim any end spaces when the current node is the first node of the parent
    const isFirstNodeOfParent = nodeStart === parentStart;
    if (isFirstNodeOfParent) {
        const whitespaceRegex = /[^\S\r\n]/;
        while (whitespaceRegex.test(currentText[removeRangeEnd]))
            removeRangeEnd++;
    }

    // remove the nodes
    const newFileText = currentText.substring(0, removeRangeStart) + currentText.substring(removeRangeEnd);
    const tempSourceFile = sourceFile.factory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());

    handleNode(sourceFile, tempSourceFile);

    function handleNode(currentNode: Node, newNode: Node) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error removing nodes!", currentNode, newNode));

        const newChildren = newNode.getChildren();
        let newChildIndex = 0;

        for (const currentChild of currentNode.getChildrenIterator()) {
            if (nonNullNodes.indexOf(currentChild) >= 0) {
                sourceFile.factory.removeNodeFromCache(currentChild);
                continue;
            }

            const newChild = newChildren[newChildIndex];
            if (newChild == null) {
                sourceFile.factory.removeNodeFromCache(currentChild);
                continue;
            }

            const isSyntaxListDisappearing = currentChild.getKind() === ts.SyntaxKind.SyntaxList && newChild.getKind() !== ts.SyntaxKind.SyntaxList;
            if (isSyntaxListDisappearing) {
                sourceFile.factory.removeNodeFromCache(currentChild);
                continue;
            }

            handleNode(currentChild, newChild);
            newChildIndex++;
        }

        sourceFile.factory.replaceCompilerNode(currentNode, newNode.getCompilerNode());
    }
}

function ensureNodePositionsContiguous(nodes: Node[]) {
    let lastPosition = nodes[0].getPos();
    for (const node of nodes) {
        if (node.getPos() !== lastPosition)
            throw new Error("Node to remove must be contiguous.");
        lastPosition = node.getEnd();
    }
}
