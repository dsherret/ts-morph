import * as ts from "typescript";
import {Node} from "./Node";
import {Expression} from "./Expression";
import {ArgumentedNode, TypeArgumentedNode} from "./../base";

export const CallExpressionBase = TypeArgumentedNode(ArgumentedNode(Node));
export class CallExpression extends CallExpressionBase<ts.CallExpression> {
    /**
     * Gets the call expression's expression.
     */
    getExpression() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile) as Expression;
    }
}
