import { errors, ts } from "@ts-morph/common";
import { DotDotDotTokenableNode } from "../base";
import { Expression } from "../expression";

export const JsxExpressionBase = DotDotDotTokenableNode(Expression);
export class JsxExpression extends JsxExpressionBase<ts.JsxExpression> {
    /**
     * Gets the expression or throws if it doesn't exist.
     */
    getExpressionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExpression(), "Expected to find an expression for the JSX expression.");
    }

    /**
     * Gets the expression or returns undefined if it doesn't exist
     */
    getExpression(): Expression | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.expression);
    }
}
