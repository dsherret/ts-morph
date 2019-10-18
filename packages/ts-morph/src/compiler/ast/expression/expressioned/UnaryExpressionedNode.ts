import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { UnaryExpression } from "../UnaryExpression";

export type UnaryExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.UnaryExpression; }>;

export interface UnaryExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): UnaryExpression;
}

export function UnaryExpressionedNode<T extends Constructor<UnaryExpressionedNodeExtensionType>>(Base: T): Constructor<UnaryExpressionedNode> & T {
    return class extends Base implements UnaryExpressionedNode {
        getExpression() {
            return this._getNodeFromCompilerNode(this.compilerNode.expression);
        }
    };
}
