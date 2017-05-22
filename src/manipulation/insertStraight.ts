import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {ArrayUtils} from "./../utils";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";

/**
 * Simple insert where the new nodes are well defined.
 */
export function insertStraight(sourceFile: SourceFile, insertPos: number, newText: string) {
    const compilerFactory = sourceFile.factory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newText + currentText.substring(insertPos);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    const allChildrenIterator = ArrayUtils.getIterator([sourceFile, ...Array.from(sourceFile.getAllChildren())]);
    const endPos = insertPos + newText.length;

    handleNode(tempSourceFile);

    function handleNode(newNode: Node) {
        const currentNode = allChildrenIterator.next().value;

        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error inserting straight.", currentNode, newNode));

        for (const newNodeChild of newNode.getChildren(tempSourceFile)) {
            // todo: is getStart slow? Maybe something could be added or changed here for performance reasons
            const newNodeChildStart = newNodeChild.getStart(tempSourceFile);
            if (newNodeChildStart >= insertPos && newNodeChildStart < endPos)
                continue;

            handleNode(newNodeChild);
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.node);
    }
}
