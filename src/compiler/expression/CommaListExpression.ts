import { ts } from "../../typescript";
import { Expression } from "./Expression";

export const CommaListExpressionBase = Expression;
export class CommaListExpression extends CommaListExpressionBase<ts.CommaListExpression> {
    /**
     * Gets the elements.
     */
    getElements(): Expression[] {
        return this.compilerNode.elements.map(e => this.getNodeFromCompilerNode(e));
    }
}
