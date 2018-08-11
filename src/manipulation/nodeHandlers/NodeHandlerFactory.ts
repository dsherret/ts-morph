import { Node } from "../../compiler";
import * as errors from "../../errors";
import { CompilerFactory } from "../../factories";
import { SyntaxKind, ts } from "../../typescript";
import { ChangeChildOrderParentHandler } from "./ChangeChildOrderParentHandler";
import { DefaultParentHandler } from "./DefaultParentHandler";
import { ForgetChangedNodeHandler } from "./ForgetChangedNodeHandler";
import { NodeHandler } from "./NodeHandler";
import { ParentFinderReplacementNodeHandler } from "./ParentFinderReplacementNodeHandler";
import { RangeParentHandler } from "./RangeParentHandler";
import { StraightReplacementNodeHandler } from "./StraightReplacementNodeHandler";
import { TryOrForgetNodeHandler } from "./TryOrForgetNodeHandler";
import { UnwrapParentHandler } from "./UnwrapParentHandler";

export interface DefaultReplaceTreeOptions {
    parent: Node;
    isFirstChild: (currentNode: ts.Node, newNode: ts.Node) => boolean;
    childCount: number;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: ts.Node) => { currentNode: Node; newNode: ts.Node; }[];
}

export interface ReplaceTreeCreatingSyntaxListOptions {
    parent: Node;
    insertPos: number;
}

export interface ReplaceTreeWithRangeOptions {
    parent: Node;
    start: number;
    end: number;
    replacingLength?: number;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: ts.Node) => { currentNode: Node; newNode: ts.Node; }[];
}

export interface ReplaceTreeWithChildIndexOptions {
    parent: Node;
    childIndex: number;
    childCount: number;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: ts.Node) => { currentNode: Node; newNode: ts.Node; }[];
}

export interface ReplaceTreeChangingChildOrderOptions {
    parent: Node;
    oldIndex: number;
    newIndex: number;
}

export interface ReplaceTreeUnwrappingNodeOptions {
    parent: Node;
    childIndex: number;
}

export class NodeHandlerFactory {
    getDefault(opts: DefaultReplaceTreeOptions) {
        const {parent: changingParent, isFirstChild, childCount, customMappings} = opts;
        const sourceFile = changingParent.getSourceFile();
        const compilerFactory = sourceFile.context.compilerFactory;
        const replacingNodes = opts.replacingNodes == null ? undefined : [...opts.replacingNodes];

        const parentHandler = new DefaultParentHandler(compilerFactory, { childCount, isFirstChild, replacingNodes, customMappings });

        if (changingParent === sourceFile)
            return parentHandler;
        else
            return new ParentFinderReplacementNodeHandler(compilerFactory, parentHandler, changingParent);
    }

    getForCreatingSyntaxList(opts: ReplaceTreeCreatingSyntaxListOptions) {
        const {parent, insertPos} = opts;
        return this.getDefault({
            parent,
            childCount: 1,
            isFirstChild: (currentNode, newNode) => newNode.kind === SyntaxKind.SyntaxList && insertPos <= newNode.getStart()
        });
    }

    getForRange(opts: ReplaceTreeWithRangeOptions) {
        const {parent: changingParent, start, end, replacingLength, replacingNodes, customMappings} = opts;
        const sourceFile = changingParent.getSourceFile();
        const compilerFactory = sourceFile.context.compilerFactory;

        const parentHandler = new RangeParentHandler(compilerFactory, { start, end, replacingLength, replacingNodes, customMappings });
        if (changingParent === sourceFile)
            return parentHandler;
        else
            return new ParentFinderReplacementNodeHandler(compilerFactory, parentHandler, changingParent);
    }

    getForChildIndex(opts: ReplaceTreeWithChildIndexOptions) {
        const {parent, childIndex, childCount, replacingNodes, customMappings} = opts;
        const parentChildren = parent.getChildren();
        errors.throwIfOutOfRange(childIndex, [0, parentChildren.length], nameof.full(opts.childIndex));
        if (childCount < 0)
            errors.throwIfOutOfRange(childCount, [childIndex - parentChildren.length, 0], nameof.full(opts.childCount));
        let i = 0;
        const isFirstChild = () => i++ === childIndex;

        return this.getDefault({
            parent,
            isFirstChild,
            childCount,
            replacingNodes,
            customMappings
        });
    }

    getForStraightReplacement(compilerFactory: CompilerFactory) {
        return new StraightReplacementNodeHandler(compilerFactory);
    }

    getForForgetChanged(compilerFactory: CompilerFactory) {
        return new ForgetChangedNodeHandler(compilerFactory);
    }

    getForTryOrForget(handler: NodeHandler) {
        return new TryOrForgetNodeHandler(handler);
    }

    getForChangingChildOrder(opts: ReplaceTreeChangingChildOrderOptions) {
        const {parent: changingParent, oldIndex, newIndex} = opts;
        const sourceFile = changingParent.getSourceFile();
        const compilerFactory = sourceFile.context.compilerFactory;
        const changeChildOrderParentHandler = new ChangeChildOrderParentHandler(compilerFactory, { oldIndex, newIndex });

        if (changingParent === sourceFile)
            return changeChildOrderParentHandler;
        else
            return new ParentFinderReplacementNodeHandler(compilerFactory, changeChildOrderParentHandler, changingParent);
    }

    getForUnwrappingNode(unwrappingNode: Node) {
        const changingParent = unwrappingNode.getParentSyntaxList() || unwrappingNode.getParentOrThrow();
        const childIndex = unwrappingNode.getChildIndex();
        const sourceFile = changingParent.getSourceFile();
        const compilerFactory = sourceFile.context.compilerFactory;
        const unwrapParentHandler = new UnwrapParentHandler(compilerFactory, childIndex);

        if (changingParent === sourceFile)
            return unwrapParentHandler;
        else
            return new ParentFinderReplacementNodeHandler(compilerFactory, unwrapParentHandler, changingParent);
    }
}
