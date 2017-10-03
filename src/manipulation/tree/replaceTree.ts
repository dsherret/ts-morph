import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node, SourceFile} from "./../../compiler";
import {AdvancedIterator} from "./../../utils";
import {getInsertErrorMessageText} from "./../getInsertErrorMessageText";
import {areNodesEqual} from "./areNodesEqual";

export interface ReplaceTreeCreatingSyntaxListOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    insertPos: number;
}

/**
 * Replaces with tree that creates a syntax list.
 */
export function replaceTreeCreatingSyntaxList(opts: ReplaceTreeCreatingSyntaxListOptions) {
    const {parent, replacementSourceFile, insertPos} = opts;
    replaceTree({
        parent,
        childCount: 1,
        replacementSourceFile,
        isFirstChild: (currentNode, newNode) => newNode.getKind() === ts.SyntaxKind.SyntaxList && insertPos <= newNode.getStart()
    });
}

export interface ReplaceTreeWithChildIndexOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    childIndex: number;
    childCount: number;
    replacingNodes?: Node[];
}

/**
 * Replaces with tree based on the child index from the parent.
 */
export function replaceTreeWithChildIndex(opts: ReplaceTreeWithChildIndexOptions) {
    const {replacementSourceFile, parent, childIndex, childCount, replacingNodes} = opts;
    const parentChildren = parent.getChildren();
    errors.throwIfOutOfRange(childIndex, [0, parentChildren.length], nameof.full(opts.childIndex));
    if (childCount < 0)
        errors.throwIfOutOfRange(childCount, [childIndex - parentChildren.length, 0], nameof.full(opts.childCount));
    let i = 0;
    const isFirstChild = () => i++ === childIndex;

    replaceTree({
        replacementSourceFile,
        parent,
        isFirstChild,
        childCount,
        replacingNodes
    });
}

export interface ReplaceTreeOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    isFirstChild: (currentNode: Node, newNode: Node) => boolean;
    childCount: number;
    replacingNodes?: Node[];
}

/**
 * Replaces the tree with a new one.
 */
export function replaceTree(opts: ReplaceTreeOptions) {
    const {replacementSourceFile, parent: changingParent, isFirstChild, childCount} = opts;
    const sourceFile = changingParent.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const replacingNodes = opts.replacingNodes == null ? undefined : [...opts.replacingNodes];
    const changingParentParent = changingParent.getParentSyntaxList() || changingParent.getParent();

    if (changingParent === sourceFile)
        handleChangingParent(sourceFile, replacementSourceFile);
    else
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

        /* istanbul ignore if */
        if (!newNodeChildren.next().done)
            throw new Error("Error replacing tree: Should not have new children left over."); // todo: better error message

        compilerFactory.replaceCompilerNode(currentNode, newNode.compilerNode);
    }

    function handleChangingParent(currentNode: Node, newNode: Node) {
        const currentNodeChildren = new AdvancedIterator(currentNode.getChildrenIterator());
        const newNodeChildren = new AdvancedIterator(newNode.getChildrenIterator());
        let count = childCount;

        // get the first child
        while (!currentNodeChildren.done && !newNodeChildren.done && !isFirstChild(currentNodeChildren.peek, newNodeChildren.peek))
            handleNode(currentNodeChildren.next(), newNodeChildren.next());

        // try replacing any nodes
        while (!currentNodeChildren.done && tryReplaceNode(currentNodeChildren.peek))
            currentNodeChildren.next();

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

    function tryReplaceNode(currentNode: Node) {
        if (replacingNodes == null || replacingNodes.length === 0)
            return false;

        const index = replacingNodes.indexOf(currentNode);
        if (index === -1)
            return false;

        replacingNodes.splice(index, 1);
        currentNode.dispose();

        return true;
    }
}
