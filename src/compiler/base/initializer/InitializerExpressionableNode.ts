import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import {Node} from "./../../common";
import {InitializerGetExpressionableNode} from "./InitializerGetExpressionableNode";
import {InitializerSetExpressionableNode} from "./InitializerSetExpressionableNode";

export type InitializerExpressionableExtensionType = Node<ts.Node & { initializer?: ts.Expression; }>;

export interface InitializerExpressionableNode extends InitializerGetExpressionableNode, InitializerSetExpressionableNode {
}

export function InitializerExpressionableNode<T extends Constructor<InitializerExpressionableExtensionType>>(Base: T): Constructor<InitializerExpressionableNode> & T {
    return InitializerSetExpressionableNode(InitializerGetExpressionableNode(Base));
}
