import * as errors from "./../errors";
import {Node, SourceFile} from "./../compiler";
import {AdvancedIterator} from "./../utils";
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
    const {replacementSourceFile, parent: changingParent, childIndex, childCount} = opts;
    const sourceFile = changingParent.getSourceFile();
    const changingParentChildren = changingParent.getChildren();
    const changingParentParent = changingParent.getParent();
    const compilerFactory = sourceFile.global.compilerFactory;

    errors.throwIfOutOfRange(childIndex, [0, changingParentChildren.length], nameof.full(opts.childIndex));
    if (childCount < 0)
        errors.throwIfOutOfRange(childIndex + childCount, [0, changingParentChildren.length], nameof.full(opts.childCount), [-childIndex, 0]);

    handleNode(sourceFile, replacementSourceFile);

    function handleNode(currentNode: Node, newNode: Node) {
        /* istanbul ignore if */
        if (currentNode.getKind() !== newNode.getKind())
            throw new errors.InvalidOperationError(getInsertErrorMessageText("Error replacing tree!", currentNode, newNode));

        const newNodeChildren = newNode.getChildrenIterator();
        const areParentParentsEqual = areNodesEqual(newNode, changingParentParent);

        for (const currentNodeChild of currentNode.getChildrenIterator()) {
            const newNodeChild = newNodeChildren.next().value;
            if (areParentParentsEqual && areNodesEqual(newNodeChild, changingParent))
                handleChangingParent(currentNodeChild, newNodeChild);
            else
                handleNode(currentNodeChild, newNodeChild);
        }

        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }

    function handleChangingParent(currentNode: Node, newNode: Node) {
        const currentNodeChildren = new AdvancedIterator(currentNode.getChildrenIterator());
        const newNodeChildren = new AdvancedIterator(newNode.getChildrenIterator());
        let count = childCount;

        if (childIndex > 0) {
            let i = 0;
            while (i < childIndex) {
                handleNode(currentNodeChildren.next(), newNodeChildren.next());
                i++;
            }
        }

        if (count > 0) {
            while (count > 0) {
                newNodeChildren.next().setSourceFile(sourceFile);
                count--;
            }
        }
        else if (count < 0) {
            while (count < 0) {
                currentNodeChildren.next().dispose();
                count++;
            }
        }

        handleRemaining();
        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);

        function handleRemaining() {
            while (!currentNodeChildren.done) {
                handleNode(currentNodeChildren.next(), newNodeChildren.next());
            }

            if (!newNodeChildren.done)
                throw new Error("Error replacing tree: Should not have more children left over."); // todo: better error message
        }
    }
}
