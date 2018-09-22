import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { WriterFunction } from "../../../types";
import { Node } from "../../common";
import { Expression } from "../Expression";

export type ExpressionedNodeExtensionType = Node<ts.Node & {expression: ts.Expression}>;

export interface ExpressionedNode {
    /**
     * Gets the expression.
     */
    getExpression(): Expression;
    /**
     * Sets the expression.
     * @param textOrWriterFunction - Text to set the expression with.
     */
    setExpression(textOrWriterFunction: string | WriterFunction): this;
}

export function ExpressionedNode<T extends Constructor<ExpressionedNodeExtensionType>>(Base: T): Constructor<ExpressionedNode> & T {
    return class extends Base implements ExpressionedNode {
        getExpression() {
            return this.getNodeFromCompilerNode(this.compilerNode.expression);
        }

        setExpression(textOrWriterFunction: string | WriterFunction) {
            this.getExpression().replaceWithText(textOrWriterFunction);
            return this;
        }
    };
}
