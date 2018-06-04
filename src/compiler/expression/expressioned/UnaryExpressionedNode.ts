import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { Node } from "../../common";
import { UnaryExpression } from "../UnaryExpression";

export type UnaryExpressionedNodeExtensionType = Node<ts.Node & {expression: ts.UnaryExpression}>;

export interface UnaryExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): UnaryExpression;
}

export function UnaryExpressionedNode<T extends Constructor<UnaryExpressionedNodeExtensionType>>(Base: T): Constructor<UnaryExpressionedNode> & T {
    return class extends Base implements UnaryExpressionedNode {
        getExpression() {
            return this.getNodeFromCompilerNode(this.compilerNode.expression);
        }
    };
}
