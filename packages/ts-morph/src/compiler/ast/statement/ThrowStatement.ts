import { Expression } from "../expression";
import { Statement } from "./Statement";
import { errors, ts } from "@ts-morph/common";

export const ThrowStatementBase = Statement;
export class ThrowStatement extends ThrowStatementBase<ts.ThrowStatement> {
    /**
     * Gets the throw statement's expression.
     */
    getExpression(): Expression | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.expression);
    }

    /**
     * Gets the throw statement's expression or throws undefined if it doesn't exist.
     */
    getExpressionOrThrow(): Expression {
        return errors.throwIfNullOrUndefined(this.getExpression(), "Expected to find the throw statement's expression.");
    }
}
