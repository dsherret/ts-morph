import {ts} from "./../../../typescript";
import {Constructor} from "./../../../Constructor";
import {SuperExpression} from "../SuperExpression";
import {Node} from "./../../common";

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
            return this.getNodeFromCompilerNode<SuperExpression>(this.compilerNode.expression);
        }
    };
}
