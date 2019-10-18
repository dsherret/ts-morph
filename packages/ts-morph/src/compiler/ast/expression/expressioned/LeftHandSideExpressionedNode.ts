import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { LeftHandSideExpression } from "../LeftHandSideExpression";

export type LeftHandSideExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.LeftHandSideExpression; }>;

export interface LeftHandSideExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): LeftHandSideExpression;
}

export function LeftHandSideExpressionedNode<T extends Constructor<LeftHandSideExpressionedNodeExtensionType>>(
    Base: T
): Constructor<LeftHandSideExpressionedNode> & T {
    return class extends Base implements LeftHandSideExpressionedNode {
        getExpression() {
            return this._getNodeFromCompilerNode(this.compilerNode.expression);
        }
    };
}
