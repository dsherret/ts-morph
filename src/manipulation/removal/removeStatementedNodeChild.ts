import {Node, OverloadableNode} from "./../../compiler";
import {getStatementedNodeChildFormatting} from "./../formatting";
import {removeChildrenWithFormatting} from "./removeChildrenWithFormatting";
import {removeChildren} from "./removeChildren";

export function removeOverloadableStatementedNodeChild(node: Node & OverloadableNode) {
    if (node.isOverload())
        removeChildren({ children: [node], removeFollowingSpaces: true, removeFollowingNewLines: true });
    else
        removeStatementedNodeChildren([...node.getOverloads(), node]);
}

export function removeStatementedNodeChild(node: Node) {
    removeStatementedNodeChildren([node]);
}

export function removeStatementedNodeChildren(node: Node[]) {
    removeChildrenWithFormatting({
        getSiblingFormatting: getStatementedNodeChildFormatting,
        children: node
    });
}
