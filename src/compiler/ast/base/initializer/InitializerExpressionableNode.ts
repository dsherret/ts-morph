import { Constructor } from "../../../../types";
import { ts } from "../../../../typescript";
import { Node } from "../../common";
import { InitializerExpressionGetableNode } from "./InitializerExpressionGetableNode";
import { InitializerSetExpressionableNode } from "./InitializerSetExpressionableNode";

export type InitializerExpressionableNodeExtensionType = Node<ts.Node & { initializer?: ts.Expression; }>;

export interface InitializerExpressionableNode extends InitializerExpressionGetableNode, InitializerSetExpressionableNode {
}

export function InitializerExpressionableNode<T extends Constructor<InitializerExpressionableNodeExtensionType>>(Base: T): Constructor<InitializerExpressionableNode> & T {
    return InitializerSetExpressionableNode(InitializerExpressionGetableNode(Base));
}
