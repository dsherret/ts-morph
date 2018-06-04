import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { Node } from "../../common";
import { InitializerGetExpressionableNode } from "./InitializerGetExpressionableNode";
import { InitializerSetExpressionableNode } from "./InitializerSetExpressionableNode";

export type InitializerExpressionableExtensionType = Node<ts.Node & { initializer?: ts.Expression; }>;

export interface InitializerExpressionableNode extends InitializerGetExpressionableNode, InitializerSetExpressionableNode {
}

export function InitializerExpressionableNode<T extends Constructor<InitializerExpressionableExtensionType>>(Base: T): Constructor<InitializerExpressionableNode> & T {
    return InitializerSetExpressionableNode(InitializerGetExpressionableNode(Base));
}
