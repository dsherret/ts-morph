import * as errors from "../../errors";
import { ts } from "../../typescript";
import { ChildOrderableNode } from "../base";
import { Expression } from "../expression";
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
    getExpression(): Expression | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.expression);
    }
}
