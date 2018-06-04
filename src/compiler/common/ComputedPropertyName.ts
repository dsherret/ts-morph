import { ts } from "../../typescript";
import { Expression } from "../expression";
import { Node } from "./Node";

export class ComputedPropertyName extends Node<ts.ComputedPropertyName> {
    /**
     * Gets the expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
    }
}
