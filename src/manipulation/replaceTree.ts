import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {getInsertErrorMessageText} from "./getInsertErrorMessageText";
import {areNodesEqual} from "./areNodesEqual";

export interface ReplaceTreeOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    childIndex: number;
    childCount: number;
}

/**
 * Replaces the tree with a new one.
 */
export function replaceTree(opts: ReplaceTreeOptions) {
    const {replacementSourceFile, parent: insertingParent, childIndex, childCount} = opts;
    const sourceFile = insertingParent.getSourceFile();
    const insertingParentChildren = insertingParent.getChildren();
    const insertingParentParent = insertingParent.getParent();
    const compilerFactory = sourceFile.global.compilerFactory;

    if (childIndex < 0 || childIndex > insertingParentChildren.length)
        throw new errors.ArgumentError(nameof(childIndex), `Range is 0 to ${insertingParentChildren.length}, but ${childIndex} was provided.`);

    handleNode(sourceFile, replacementSourceFile);

    function handleNode(currentNode: Node, newNode: Node) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error replacing tree!", currentNode, newNode));

        const newNodeChildren = newNode.getChildrenIterator();
        const areParentParentsEqual = areNodesEqual(newNode, insertingParentParent);

        for (const currentNodeChild of currentNode.getChildrenIterator()) {
            const newNodeChild = newNodeChildren.next().value;
            if (areParentParentsEqual && areNodesEqual(newNodeChild, insertingParent))
                handleInsertingParent(currentNodeChild, newNodeChild);
            else
                handleNode(currentNodeChild, newNodeChild);
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }

    function handleInsertingParent(currentNode: Node, newNode: Node) {
        const currentNodeChildren = currentNode.getChildrenIterator();
        const newNodeChildren = newNode.getChildrenIterator();
        let count = childCount;

        if (childIndex > 0) {
            let i = 0;
            while (i < childIndex) {
                handleNode(currentNodeChildren.next().value, newNodeChildren.next().value);
                i++;
            }
        }

        if (count > 0) {
            while (count > 0) {
                newNodeChildren.next().value.setSourceFile(sourceFile);
                count--;
            }
        }
        else if (count < 0) {
            while (count < 0) {
                currentNodeChildren.next().value.dispose();
                count++;
            }
        }

        handleRemaining();
        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);

        function handleRemaining() {
            let currentNodeChild = currentNodeChildren.next();
            let newNodeChild = newNodeChildren.next();
            while (!currentNodeChild.done) {
                handleNode(currentNodeChild.value, newNodeChild.value);
                currentNodeChild = currentNodeChildren.next();
                newNodeChild = newNodeChildren.next();
            }

            if (!newNodeChild.done)
                throw new Error("Error replacing tree: Should not have more children left over."); // todo: better error message
        }
    }
}
