import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {ArrayUtils} from "./../utils";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";

export interface InsertStraightOptions {
    insertPos: number;
    replacing?: {
        length: number;
        nodes: Node[];
    };
    parent: Node;
    newCode: string;
}

/**
 * Simple insert where the new nodes are well defined.
 */
export function insertStraight(options: InsertStraightOptions) {
    const {insertPos, parent, newCode, replacing} = options;
    const sourceFile = parent.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const currentText = sourceFile.getFullText();
    const newFileText = currentText.substring(0, insertPos) + newCode + currentText.substring(replacing != null ? insertPos + replacing.length : insertPos);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());
    const allChildrenIterator = ArrayUtils.getIterator([sourceFile, ...Array.from(sourceFile.getAllChildren())]);
    const endPos = insertPos + newCode.length;

    handleNode(tempSourceFile);

    function handleNode(newNode: Node) {
        let currentNode = allChildrenIterator.next().value;

        while (replacing != null && replacing.nodes.indexOf(currentNode) >= 0) {
            currentNode.dispose();
            currentNode = allChildrenIterator.next().value;
        }

        const parentMatches = parent.getPos() === newNode.getPos() && parent.getKind() === newNode.getKind();

        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error inserting straight.", currentNode, newNode));

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

        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
