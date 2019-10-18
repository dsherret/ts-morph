import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { ImportExpression } from "../ImportExpression";

export type ImportExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.ImportExpression; }>;

export interface ImportExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): ImportExpression;
}

export function ImportExpressionedNode<T extends Constructor<ImportExpressionedNodeExtensionType>>(Base: T): Constructor<ImportExpressionedNode> & T {
    return class extends Base implements ImportExpressionedNode {
        getExpression() {
            return this._getNodeFromCompilerNode(this.compilerNode.expression);
        }
    };
}
