import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node, SourceFile} from "./../../compiler";
import {AdvancedIterator} from "./../../utils";
import {getInsertErrorMessageText} from "./../getInsertErrorMessageText";
import {areNodesEqual} from "./areNodesEqual";

export interface ReplaceTreeCreatingSyntaxListOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
}

/**
 * Replaces with tree that creates a syntax list.
 */
export function replaceTreeCreatingSyntaxList(opts: ReplaceTreeCreatingSyntaxListOptions) {
    const {parent, replacementSourceFile} = opts;
    replaceTree({
        parent,
        childCount: 1,
        replacementSourceFile,
        isFirstChild: (currentNode, newNode) => newNode.getKind() === ts.SyntaxKind.SyntaxList && currentNode.getKind() !== ts.SyntaxKind.SyntaxList
    });
}

export interface ReplaceTreeWithChildIndexOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    childIndex: number;
    childCount: number;
}

/**
 * Replaces with tree based on the child index from the parent.
 */
export function replaceTreeWithChildIndex(opts: ReplaceTreeWithChildIndexOptions) {
    const {replacementSourceFile, parent, childIndex, childCount} = opts;
    const parentChildren = parent.getChildren();
    errors.throwIfOutOfRange(childIndex, [0, parentChildren.length], nameof.full(opts.childIndex));
    if (childCount < 0)
        errors.throwIfOutOfRange(childIndex + childCount, [0, parentChildren.length], nameof.full(opts.childCount), [-childIndex, 0]);
    let i = 0;
    const isFirstChild = () => i++ === childIndex;

    replaceTree({
        replacementSourceFile,
        parent,
        isFirstChild,
        childCount
    });
}

export interface ReplaceTreeOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    isFirstChild: (currentNode: Node, newNode: Node) => boolean;
    childCount: number;
}

/**
 * Replaces the tree with a new one.
 */
export function replaceTree(opts: ReplaceTreeOptions) {
    const {replacementSourceFile, parent: changingParent, isFirstChild, childCount} = opts;
    const sourceFile = changingParent.getSourceFile();
    const changingParentParent = changingParent.getParentSyntaxList() || changingParent.getParentOrThrow();
    const compilerFactory = sourceFile.global.compilerFactory;

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

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && !isFirstChild(currentNodeChildren.peek, newNodeChildren.peek))
            handleNode(currentNodeChildren.next(), newNodeChildren.next());

        // add or remove the items
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

        // handle the rest
        while (!currentNodeChildren.done) {
            handleNode(currentNodeChildren.next(), newNodeChildren.next());
        }

        // ensure the new children iterator is done too
        if (!newNodeChildren.done)
            throw new Error("Error replacing tree: Should not have more children left over."); // todo: better error message

        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }
}
