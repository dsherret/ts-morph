import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {ArrayUtils} from "./../utils";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";

export interface InsertStraightOptions {
    insertPos: number;
    parent: Node;
    newCode: string;
}

/**
 * Simple insert where the new nodes are well defined.
 */
export function insertStraight(options: InsertStraightOptions) {
    const {insertPos, parent, newCode} = options;
    const sourceFile = parent.getSourceFile();
    const compilerFactory = sourceFile.factory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newCode + currentText.substring(insertPos);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    const allChildrenIterator = ArrayUtils.getIterator([sourceFile, ...Array.from(sourceFile.getAllChildren())]);
    const endPos = insertPos + newCode.length;

    handleNode(tempSourceFile);

    function handleNode(newNode: Node) {
        const currentNode = allChildrenIterator.next().value;

        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error inserting straight.", currentNode, newNode));

        const parentMatches = parent.getPos() === newNode.getPos() && parent.getKind() === newNode.getKind();

        for (const newNodeChild of newNode.getChildren()) {
            if (parentMatches) {
                const newNodeChildStart = newNodeChild.getStart();
                if (newNodeChildStart >= insertPos && newNodeChildStart < endPos) {
                    newNodeChild.setSourceFile(sourceFile);
                    continue;
                }
            }

            handleNode(newNodeChild);
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.node);
    }
}
