import { ts } from "../../typescript";
import * as errors from "../../errors";
import { Expression } from "../expression";
import { Node } from "../common";
import { ChildOrderableNode } from "../base";
import { Statement } from "./Statement";

export const ReturnStatementBase = ChildOrderableNode(Statement);
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
        return this.getNodeFromCompilerNodeIfExists<Expression>(this.compilerNode.expression);
    }
}
