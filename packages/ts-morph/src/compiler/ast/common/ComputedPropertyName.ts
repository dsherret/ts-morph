import { ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { Node } from "./Node";

export class ComputedPropertyName extends Node<ts.ComputedPropertyName> {
    /**
     * Gets the expression.
     */
    getExpression(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
