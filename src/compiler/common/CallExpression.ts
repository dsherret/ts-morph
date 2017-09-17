import * as ts from "typescript";
import {Node} from "./Node";
import {Expression} from "./Expression";
import {ArgumentedNode, TypeArgumentedNode} from "./../base";
import {Type} from "./../type";

export const CallExpressionBase = TypeArgumentedNode(ArgumentedNode(Node));
export class CallExpression extends CallExpressionBase<ts.CallExpression> {
    /**
     * Gets the call expression's expression.
     */
    getExpression() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile) as Node as Expression;
    }

    /**
     * Gets the return type of the call expression.
     */
    getReturnType(): Type {
        return this.global.typeChecker.getTypeAtLocation(this);
    }
}
