import * as ts from "typescript";
import {Expression} from "./../common";
import {Statement} from "./Statement";

export const ThrowStatementBase = Statement;
export class ThrowStatement extends ThrowStatementBase<ts.ThrowStatement> {
    /**
     * Gets this do statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }
}
