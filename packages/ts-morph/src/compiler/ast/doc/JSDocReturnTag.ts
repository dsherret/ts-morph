import { ts, errors } from "@ts-morph/common";
import { JSDocTag } from "./JSDocTag";

/**
 * JS doc return tag node.
 */
export class JSDocReturnTag extends JSDocTag<ts.JSDocReturnTag> {
    /**
     * Gets the type expression node of the JS doc return tag if it exists.
     */
    getTypeExpression() {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.typeExpression);
    }

    /**
     * Gets the type expression node of the JS doc return tag or throws if it doesn't exist.
     */
    getTypeExpressionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getTypeExpression(), `Expected to find a ${nameof(JSDocReturnTag)}'s type expression.`);
    }
}
