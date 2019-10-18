import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { SuperExpression } from "../SuperExpression";

export type SuperExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.SuperExpression; }>;

export interface SuperExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): SuperExpression;
}

export function SuperExpressionedNode<T extends Constructor<SuperExpressionedNodeExtensionType>>(Base: T): Constructor<SuperExpressionedNode> & T {
    return class extends Base implements SuperExpressionedNode {
        getExpression() {
            return this._getNodeFromCompilerNode(this.compilerNode.expression);
        }
    };
}
