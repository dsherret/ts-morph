import { ts } from "@ts-morph/common";
import { Expression } from "./Expression";

export const ConditionalExpressionBase = Expression;
export class ConditionalExpression extends ConditionalExpressionBase<ts.ConditionalExpression> {
    /**
     * Gets the condition of the conditional expression.
     */
    getCondition(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.condition);
    }

    /**
     * Gets the question token of the conditional expression.
     */
    getQuestionToken() {
        return this._getNodeFromCompilerNode(this.compilerNode.questionToken);
    }

    /**
     * Gets the when true expression of the conditional expression.
     */
    getWhenTrue(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.whenTrue);
    }

    /**
     * Gets the colon token of the conditional expression.
     */
    getColonToken() {
        return this._getNodeFromCompilerNode(this.compilerNode.colonToken);
    }

    /**
     * Gets the when false expression of the conditional expression.
     */
    getWhenFalse(): Expression {
        return this._getNodeFromCompilerNode(this.compilerNode.whenFalse);
    }
}
