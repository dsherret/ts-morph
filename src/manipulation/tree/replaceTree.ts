import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node, SourceFile} from "./../../compiler";
import {CompilerFactory} from "./../../factories";
import {DefaultParentHandler} from "./DefaultParentHandler";
import {ParentFinderReplacementNodeHandler} from "./ParentFinderReplacementNodeHandler";

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

    const parentHandler = new DefaultParentHandler(compilerFactory, { childCount, isFirstChild, replacingNodes });

    if (changingParent === sourceFile)
        parentHandler.handleNode(sourceFile, replacementSourceFile);
    else {
        const parentFinderReplacement = new ParentFinderReplacementNodeHandler(compilerFactory, parentHandler, changingParent);
        parentFinderReplacement.handleNode(sourceFile, replacementSourceFile);
    }
}
