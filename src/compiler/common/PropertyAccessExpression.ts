import * as ts from "typescript";
import {NamedNode} from "./../base";
import {Node} from "./Node";
import {Expression} from "./Expression";

export const PropertyAccessExpressionBase = NamedNode(Expression);
export class PropertyAccessExpression extends PropertyAccessExpressionBase<ts.PropertyAccessExpression> {
    /**
     * Gets the expression node.
     */
    getExpression() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile) as Expression<ts.LeftHandSideExpression>;
    }
}
