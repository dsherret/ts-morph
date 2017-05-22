import * as ts from "typescript";
import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {ArrayUtils} from "./../utils";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";

/**
 * Replace insert where the new and old nodes are well defined.
 */
export function replaceStraight(sourceFile: SourceFile, replacePos: number, replaceLength: number, newText: string) {
    const compilerFactory = sourceFile.factory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, replacePos) + newText + currentText.substring(replacePos + replaceLength);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    const endPos = replacePos + newText.length;
    const removedNodes: Node[] = [];

    handleNode(sourceFile, tempSourceFile);
    removedNodes.forEach(n => compilerFactory.removeNodeFromCache(n));

    function handleNode(currentNode: Node, newNode: Node) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error inserting straight.", currentNode, newNode));

        const currentNodeChildren = currentNode.getChildren(sourceFile);
        let currentNodeChild: Node | undefined;
        for (const newNodeChild of newNode.getChildren(tempSourceFile)) {
            // todo: is getStart slow? Maybe something could be added or changed here for performance reasons
            const newNodeChildStart = newNodeChild.getStart(tempSourceFile);
            if (newNodeChildStart >= replacePos && newNodeChildStart < endPos)
                continue;

            let currentNodeChildStart: number;
            currentNodeChild = undefined;
            do {
                if (currentNodeChild != null)
                    removedNodes.push(currentNodeChild);
                currentNodeChild = currentNodeChildren.next().value;
                currentNodeChildStart = currentNodeChild.getStart(sourceFile);
            }
            while (currentNodeChild.getKind() === ts.SyntaxKind.TypeReference ||
                replaceLength > 0 && currentNodeChildStart >= replacePos && currentNodeChildStart < replacePos + replaceLength);

            handleNode(currentNodeChild, newNodeChild);
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.node);
    }
}
