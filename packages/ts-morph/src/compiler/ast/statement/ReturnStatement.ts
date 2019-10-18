import { errors, ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { Statement } from "./Statement";

export class ReturnStatement extends Statement<ts.ReturnStatement> {
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
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.expression);
    }
}
