import { ExpressionedNodeStructure } from "../../../../structures";
import { Constructor, WriterFunction } from "../../../../types";
import { ts } from "../../../../typescript";
import { callBaseSet } from "../../callBaseSet";
import { Node } from "../../common";
import { Expression } from "../Expression";

export type ExpressionedNodeExtensionType = Node<ts.Node & { expression: ts.Expression; }>;

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
            return this._getNodeFromCompilerNode(this.compilerNode.expression);
        }

        setExpression(textOrWriterFunction: string | WriterFunction) {
            this.getExpression().replaceWithText(textOrWriterFunction);
            return this;
        }

        set(structure: Partial<ExpressionedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.expression != null)
                this.setExpression(structure.expression);

            return this;
        }
    };
}
