import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { Node } from "../../common";
import { Expression } from "../Expression";

export type ExpressionedNodeExtensionType = Node<ts.Node & {expression: ts.Expression}>;

export interface ExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): Expression;
}

export function ExpressionedNode<T extends Constructor<ExpressionedNodeExtensionType>>(Base: T): Constructor<ExpressionedNode> & T {
    return class extends Base implements ExpressionedNode {
        getExpression() {
            return this.getNodeFromCompilerNode(this.compilerNode.expression);
        }
    };
}
