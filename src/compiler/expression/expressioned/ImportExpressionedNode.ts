import {ts} from "./../../../typescript";
import {Constructor} from "./../../../Constructor";
import {ImportExpression} from "../ImportExpression";
import {Node} from "./../../common";

export type ImportExpressionedNodeExtensionType = Node<ts.Node & {expression: ts.ImportExpression}>;

export interface ImportExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): ImportExpression;
}

export function ImportExpressionedNode<T extends Constructor<ImportExpressionedNodeExtensionType>>(Base: T): Constructor<ImportExpressionedNode> & T {
    return class extends Base implements ImportExpressionedNode {
        getExpression() {
            return this.getNodeFromCompilerNode<ImportExpression>(this.compilerNode.expression);
        }
    };
}
