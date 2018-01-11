import * as ts from "typescript";
import * as errors from "./../../errors";
import {Expression} from "./Expression";
import {GeneratorableNode} from "../base";

export const YieldExpressionBase = GeneratorableNode(Expression);
export class YieldExpression extends YieldExpressionBase<ts.YieldExpression> {
    /**
     * Gets the expression or undefined of the yield expression.
     */
    getExpression() {
        return this.compilerNode.expression == null
            ? undefined
            : this.getNodeFromCompilerNode(this.compilerNode.expression) as Expression;
    }

    /**
     * Gets the expression of the yield expression or throws if it does not exist.
     */
    getExpressionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExpression(), "Expected to find an expression.");
    }
}
