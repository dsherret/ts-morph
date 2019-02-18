import { Node, OverloadableNode } from "../../compiler";
import { SyntaxKind } from "../../typescript";
import { TypeGuards } from "../../utils";
import { FormattingKind, getClassMemberFormatting, getClausedNodeChildFormatting, getInterfaceMemberFormatting, getStatementedNodeChildFormatting } from "../formatting";
import { NodeHandlerFactory } from "../nodeHandlers";
import { RemoveChildrenTextManipulator, RemoveChildrenWithFormattingTextManipulator, UnwrapTextManipulator } from "../textManipulators";
import { doManipulation } from "./doManipulation";

export interface RemoveChildrenOptions {
    children: Node[];
    removePrecedingSpaces?: boolean;
    removeFollowingSpaces?: boolean;
    removePrecedingNewLines?: boolean;
    removeFollowingNewLines?: boolean;
}

export function removeChildren(opts: RemoveChildrenOptions) {
    const { children } = opts;
    if (children.length === 0)
        return;

    doManipulation(children[0].getSourceFile(),
        new RemoveChildrenTextManipulator(opts),
        new NodeHandlerFactory().getForChildIndex({
            parent: children[0].getParentSyntaxList() || children[0].getParentOrThrow(),
            childIndex: children[0].getChildIndex(),
            childCount: -1 * children.length
        }));
}

export interface RemoveChildrenWithFormattingOptions<TNode extends Node> {
    children: Node[];
    getSiblingFormatting: (parent: TNode, sibling: Node) => FormattingKind;
}

export function removeChildrenWithFormattingFromCollapsibleSyntaxList<TNode extends Node>(opts: RemoveChildrenWithFormattingOptions<TNode>) {
    const { children } = opts;
    if (children.length === 0)
        return;

    const syntaxList = children[0].getParentSyntaxListOrThrow();
    if (syntaxList.getChildCount() === children.length) {
        removeChildrenWithFormatting({
            children: [syntaxList],
            getSiblingFormatting: () => FormattingKind.None
        });
    }
    else
        removeChildrenWithFormatting(opts);
}

export function removeChildrenWithFormatting<TNode extends Node>(opts: RemoveChildrenWithFormattingOptions<TNode>) {
    const { children, getSiblingFormatting } = opts;
    if (children.length === 0)
        return;

    doManipulation(children[0]._sourceFile, new RemoveChildrenWithFormattingTextManipulator<TNode>({
        children,
        getSiblingFormatting
    }), new NodeHandlerFactory().getForChildIndex({
        parent: children[0].getParentSyntaxList() || children[0].getParentOrThrow(),
        childIndex: children[0].getChildIndex(),
        childCount: -1 * children.length
    }));
}

export function removeOverloadableClassMember(classMember: Node & OverloadableNode) {
    if (classMember.isOverload()) {
        const parent = classMember.getParentOrThrow();
        if (TypeGuards.isAmbientableNode(parent) && parent.isAmbient())
            removeClassMember(classMember);
        else
            removeChildren({ children: [classMember], removeFollowingSpaces: true, removeFollowingNewLines: true });
    }
    else
        removeClassMembers([...classMember.getOverloads(), classMember]);
}

export function removeClassMember(classMember: Node) {
    removeClassMembers([classMember]);
}

export function removeClassMembers(classMembers: Node[]) {
    removeChildrenWithFormatting({
        getSiblingFormatting: getClassMemberFormatting,
        children: classMembers
    });
}

export function removeInterfaceMember(classMember: Node) {
    removeInterfaceMembers([classMember]);
}

export function removeInterfaceMembers(classMembers: Node[]) {
    removeChildrenWithFormatting({
        getSiblingFormatting: getInterfaceMemberFormatting,
        children: classMembers
    });
}

export function removeCommaSeparatedChild(child: Node) {
    const childrenToRemove: Node[] = [child];
    const syntaxList = child.getParentSyntaxListOrThrow();
    const isRemovingFirstChild = childrenToRemove[0] === syntaxList.getFirstChild();

    addNextCommaIfAble();
    addPreviousCommaIfAble();

    removeChildren({
        children: childrenToRemove,
        removePrecedingSpaces: !isRemovingFirstChild,
        removeFollowingSpaces: isRemovingFirstChild,
        removePrecedingNewLines: !isRemovingFirstChild,
        removeFollowingNewLines: isRemovingFirstChild
    });

    function addNextCommaIfAble() {
        const commaToken = child.getNextSiblingIfKind(SyntaxKind.CommaToken);

        if (commaToken != null)
            childrenToRemove.push(commaToken);
    }

    function addPreviousCommaIfAble() {
        if (syntaxList.getLastChild() !== childrenToRemove[childrenToRemove.length - 1])
            return;

        const precedingComma = child.getPreviousSiblingIfKind(SyntaxKind.CommaToken);
        if (precedingComma != null)
            childrenToRemove.unshift(precedingComma);
    }
}

export function removeOverloadableStatementedNodeChild(node: Node & OverloadableNode) {
    if (node.isOverload())
        removeChildren({ children: [node], removeFollowingSpaces: true, removeFollowingNewLines: true });
    else
        removeStatementedNodeChildren([...node.getOverloads(), node]);
}

export function removeStatementedNodeChild(node: Node) {
    removeStatementedNodeChildren([node]);
}

export function removeStatementedNodeChildren(nodes: Node[]) {
    removeChildrenWithFormatting({
        getSiblingFormatting: getStatementedNodeChildFormatting,
        children: nodes
    });
}

export function removeClausedNodeChild(node: Node) {
    removeClausedNodeChildren([node]);
}

export function removeClausedNodeChildren(nodes: Node[]) {
    removeChildrenWithFormatting({
        getSiblingFormatting: getClausedNodeChildFormatting,
        children: nodes
    });
}

export function unwrapNode(node: Node) {
    doManipulation(node._sourceFile,
        new UnwrapTextManipulator(node),
        new NodeHandlerFactory().getForUnwrappingNode(node));
}
