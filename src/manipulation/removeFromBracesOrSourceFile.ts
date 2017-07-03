import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";
import {areNodesEqual} from "./areNodesEqual";
import {getPosAfterPreviousNonBlankLine, getPosAtNextNonBlankLine} from "./textSeek";

export interface RemoveFromBracesOrSourceFileOptions {
    node: Node;
}

export function removeFromBracesOrSourceFile(opts: RemoveFromBracesOrSourceFileOptions) {
    const {node} = opts;
    const sourceFile = node.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const syntaxList = node.getParentSyntaxListOrThrow();
    const syntaxListParent = syntaxList.getParent();
    const currentText = sourceFile.getFullText();
    const removingIndex = node.getChildIndex();
    const childrenCount = syntaxList.getChildCount();
    let removeRangeStart = getStart(currentText, node.getPos());
    const removeRangeEnd = getPosAtNextNonBlankLine(currentText, node.getEnd());

    if (removingIndex === 0 || removingIndex === childrenCount - 1)
        removeRangeStart = getPosAfterPreviousNonBlankLine(currentText, removeRangeStart);

    const newFileText = currentText.substring(0, removeRangeStart) + currentText.substring(removeRangeEnd);
    const tempSourceFile = compilerFactory.createTempSourceFileFromText(newFileText, sourceFile.getFilePath());

    handleNode(sourceFile, tempSourceFile);
    node.dispose();

    function handleNode(currentNode: Node, newNode: Node) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error removing nodes!", currentNode, newNode));

        const currentNodeChildren = currentNode.getChildrenIterator();

        for (const newNodeChild of newNode.getChildrenIterator()) {
            if (areNodesEqual(newNodeChild, syntaxList) && areNodesEqual(newNodeChild.getParent(), syntaxListParent))
                handleSyntaxList(currentNodeChildren.next().value, newNodeChild);
            else
                handleNode(currentNodeChildren.next().value, newNodeChild);
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }

    function handleSyntaxList(currentNode: Node, newNode: Node) {
        const currentNodeChildren = currentNode.getChildrenIterator();
        let i = 0;

        for (const newNodeChild of newNode.getChildren()) {
            if (i === removingIndex) {
                // skip over the removing node
                currentNodeChildren.next().value;
            }
            const currentChild = currentNodeChildren.next().value;
            handleNode(currentChild, newNodeChild);
            i++;
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}

function getStart(text: string, pos: number) {
    // 1. find first non-space character
    // 2. get start of line or pos
    const spaceRegex = /\s/;
    const firstNonSpacePos = getFirstNonSpacePos();

    for (let i = firstNonSpacePos - 1; i >= pos; i--) {
        if (text[i] === "\n")
            return i + 1;
    }

    return pos;

    function getFirstNonSpacePos() {
        for (let i = pos; i < text.length; i++) {
            if (!spaceRegex.test(text[i]))
                return i;
        }
        return pos;
    }
}
