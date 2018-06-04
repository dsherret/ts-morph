import * as errors from "../../errors";
import { ts } from "../../typescript";
import { GeneratorableNode } from "../base";
import { Expression } from "./Expression";

export const YieldExpressionBase = GeneratorableNode(Expression);
export class YieldExpression extends YieldExpressionBase<ts.YieldExpression> {
    /**
     * Gets the expression or undefined of the yield expression.
     */
    getExpression(): Expression | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.expression);
    }

    /**
     * Gets the expression of the yield expression or throws if it does not exist.
     */
    getExpressionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExpression(), "Expected to find an expression.");
    }
}
