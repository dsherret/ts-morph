import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { Node } from "../../common";
import { SuperExpression } from "../SuperExpression";

export type SuperExpressionedNodeExtensionType = Node<ts.Node & {expression: ts.SuperExpression}>;

export interface SuperExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): SuperExpression;
}

export function SuperExpressionedNode<T extends Constructor<SuperExpressionedNodeExtensionType>>(Base: T): Constructor<SuperExpressionedNode> & T {
    return class extends Base implements SuperExpressionedNode {
        getExpression() {
            return this.getNodeFromCompilerNode(this.compilerNode.expression);
        }
    };
}
