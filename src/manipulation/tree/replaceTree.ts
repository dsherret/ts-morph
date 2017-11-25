import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node, SourceFile} from "./../../compiler";
import {CompilerFactory} from "./../../factories";
import {DefaultParentHandler, ParentFinderReplacementNodeHandler, RangeParentHandler} from "./nodeHandlers";

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
    customMappings?: (newParentNode: Node) => { currentNode: Node; newNode: Node; }[];
}

/**
 * Replaces the tree based on the child index from the parent.
 */
export function replaceTreeWithChildIndex(opts: ReplaceTreeWithChildIndexOptions) {
    const {replacementSourceFile, parent, childIndex, childCount, replacingNodes, customMappings} = opts;
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
        replacingNodes,
        customMappings
    });
}

export interface ReplaceTreeWithRangeOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    start: number;
    end: number;
}

/**
 * Replaces the tree based on the start and end position.
 */
export function replaceTreeWithRange(opts: ReplaceTreeWithRangeOptions) {
    const {replacementSourceFile, parent: changingParent, start, end} = opts;
    const sourceFile = changingParent.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;

    const parentHandler = new RangeParentHandler(compilerFactory, { start, end });

    if (changingParent === sourceFile)
        parentHandler.handleNode(sourceFile, replacementSourceFile);
    else {
        const parentFinderReplacement = new ParentFinderReplacementNodeHandler(compilerFactory, parentHandler, changingParent);
        parentFinderReplacement.handleNode(sourceFile, replacementSourceFile);
    }
}

export interface ReplaceTreeOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    isFirstChild: (currentNode: ts.Node, newNode: Node) => boolean;
    childCount: number;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: Node) => { currentNode: Node; newNode: Node; }[];
}

/**
 * Replaces the tree with a new one.
 */
export function replaceTree(opts: ReplaceTreeOptions) {
    const {replacementSourceFile, parent: changingParent, isFirstChild, childCount, customMappings} = opts;
    const sourceFile = changingParent.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const replacingNodes = opts.replacingNodes == null ? undefined : [...opts.replacingNodes];

    const parentHandler = new DefaultParentHandler(compilerFactory, { childCount, isFirstChild, replacingNodes, customMappings });

    if (changingParent === sourceFile)
        parentHandler.handleNode(sourceFile, replacementSourceFile);
    else {
        const parentFinderReplacement = new ParentFinderReplacementNodeHandler(compilerFactory, parentHandler, changingParent);
        parentFinderReplacement.handleNode(sourceFile, replacementSourceFile);
    }
}
