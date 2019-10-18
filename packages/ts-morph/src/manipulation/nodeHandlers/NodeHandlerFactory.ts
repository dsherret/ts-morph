import { Node, SourceFile } from "../../compiler";
import { errors, ts } from "@ts-morph/common";
import { CompilerFactory } from "../../factories";
import { ChangeChildOrderParentHandler } from "./ChangeChildOrderParentHandler";
import { DefaultParentHandler } from "./DefaultParentHandler";
import { ForgetChangedNodeHandler } from "./ForgetChangedNodeHandler";
import { NodeHandler } from "./NodeHandler";
import { ParentFinderReplacementNodeHandler } from "./ParentFinderReplacementNodeHandler";
import { RangeHandler } from "./RangeHandler";
import { RenameNodeHandler } from "./RenameNodeHandler";
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

export interface ReplaceTreeWithParentRangeOptions {
    parent: Node;
    start: number;
    end: number;
    replacingLength?: number;
    replacingNodes?: Node[];
    customMappings?: (newParentNode: ts.Node, newSourceFile: ts.SourceFile) => { currentNode: Node; newNode: ts.Node; }[];
}

export interface ReplaceTreeWithRangeOptions {
    sourceFile: SourceFile;
    start: number;
    end: number;
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
        const { parent: changingParent, isFirstChild, childCount, customMappings } = opts;
        const sourceFile = changingParent.getSourceFile();
        const compilerFactory = sourceFile._context.compilerFactory;
        const replacingNodes = opts.replacingNodes == null ? undefined : [...opts.replacingNodes];

        const parentHandler = new DefaultParentHandler(compilerFactory, { childCount, isFirstChild, replacingNodes, customMappings });

        if (changingParent === sourceFile)
            return parentHandler;
        else
            return new ParentFinderReplacementNodeHandler(compilerFactory, parentHandler, changingParent);
    }

    getForParentRange(opts: ReplaceTreeWithParentRangeOptions) {
        const { parent: changingParent, start, end, replacingLength, replacingNodes, customMappings } = opts;
        const sourceFile = changingParent.getSourceFile();
        const compilerFactory = sourceFile._context.compilerFactory;

        const parentHandler = new RangeParentHandler(compilerFactory, { start, end, replacingLength, replacingNodes, customMappings });
        if (changingParent === sourceFile)
            return parentHandler;
        else
            return new ParentFinderReplacementNodeHandler(compilerFactory, parentHandler, changingParent);
    }

    getForRange(opts: ReplaceTreeWithRangeOptions) {
        const { sourceFile, start, end } = opts;
        const compilerFactory = sourceFile._context.compilerFactory;

        return new RangeHandler(compilerFactory, { start, end });
    }

    getForChildIndex(opts: ReplaceTreeWithChildIndexOptions) {
        const { parent, childIndex, childCount, replacingNodes, customMappings } = opts;
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

    getForRename(compilerFactory: CompilerFactory) {
        return new RenameNodeHandler(compilerFactory);
    }

    getForTryOrForget(handler: NodeHandler) {
        return new TryOrForgetNodeHandler(handler);
    }

    getForChangingChildOrder(opts: ReplaceTreeChangingChildOrderOptions) {
        const { parent: changingParent, oldIndex, newIndex } = opts;
        const sourceFile = changingParent.getSourceFile();
        const compilerFactory = sourceFile._context.compilerFactory;
        const changeChildOrderParentHandler = new ChangeChildOrderParentHandler(compilerFactory, { oldIndex, newIndex });

        if (changingParent === sourceFile)
            return changeChildOrderParentHandler;
        else
            return new ParentFinderReplacementNodeHandler(compilerFactory, changeChildOrderParentHandler, changingParent);
    }

    getForUnwrappingNode(unwrappingNode: Node) {
        const changingParent: Node = unwrappingNode.getParentSyntaxList() || unwrappingNode.getParentOrThrow();
        const childIndex = unwrappingNode.getChildIndex();
        const sourceFile = changingParent.getSourceFile();
        const compilerFactory = sourceFile._context.compilerFactory;
        const unwrapParentHandler = new UnwrapParentHandler(compilerFactory, childIndex);

        if (changingParent === sourceFile)
            return unwrapParentHandler;
        else
            return new ParentFinderReplacementNodeHandler(compilerFactory, unwrapParentHandler, changingParent);
    }
}
