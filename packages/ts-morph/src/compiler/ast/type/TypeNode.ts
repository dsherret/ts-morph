import { ts } from "@ts-morph/common";
import { TypeArgumentedNode } from "../base";
import { Node } from "../common";

export class TypeNode<T extends ts.TypeNode = ts.TypeNode> extends Node<T> {
}

export const NodeWithTypeArgumentsBase = TypeArgumentedNode(TypeNode);
export class NodeWithTypeArguments<T extends ts.NodeWithTypeArguments = ts.NodeWithTypeArguments> extends NodeWithTypeArgumentsBase<T> {
}
