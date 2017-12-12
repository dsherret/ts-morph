import * as ts from "typescript";
import * as errors from "./../../errors";
import {removeStatementedNodeChild} from "./../../manipulation";
import {Node, Expression} from "./../common";
import {ChildOrderableNode} from "./../base";

export const ReturnStatementBase = ChildOrderableNode(Node);
export class ReturnStatement extends ReturnStatementBase<ts.ReturnStatement> {
    /**
     * Gets this return statement's expression if it exists or throws.
     */
    getExpressionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExpression(), "Expected to find a return expression's expression.");
    }

    /**
     * Gets this return statement's expression if it exists.
     */
    getExpression() {
        const expression = this.compilerNode.expression;
        if (expression == null)
            return undefined;
        return this.global.compilerFactory.getNodeFromCompilerNode(expression, this.sourceFile) as Expression;
    }

    /**
     * Removes this return statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
