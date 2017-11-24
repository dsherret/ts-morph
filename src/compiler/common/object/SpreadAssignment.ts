import * as ts from "typescript";
import {Node} from "./../Node";
import {Expression} from "./../Expression";

export class SpreadAssignment extends Node<ts.SpreadAssignment> {
    /**
     * Gets the spread assignment's expression.
     */
    getExpression() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.expression, this.sourceFile) as Expression;
    }
}
