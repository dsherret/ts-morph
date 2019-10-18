import { ts } from "@ts-morph/common";
import { Expression } from "./Expression";

export const CommaListExpressionBase = Expression;
export class CommaListExpression extends CommaListExpressionBase<ts.CommaListExpression> {
    /**
     * Gets the elements.
     */
    getElements(): Expression[] {
        return this.compilerNode.elements.map(e => this._getNodeFromCompilerNode(e));
    }
}
