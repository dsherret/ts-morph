import { ts, SyntaxKind } from "../../typescript";
import { Node } from "../common";
import { Expression } from "./Expression";

export const ConditionalExpressionBase = Expression;
export class ConditionalExpression extends ConditionalExpressionBase<ts.ConditionalExpression> {
    /**
     * Gets the condition of the conditional expression.
     */
    getCondition() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.condition);
    }

    /**
     * Gets the question token of the conditional expression.
     */
    getQuestionToken() {
        return this.getNodeFromCompilerNode(this.compilerNode.questionToken);
    }

    /**
     * Gets the when true expression of the conditional expression.
     */
    getWhenTrue() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.whenTrue);
    }

    /**
     * Gets the colon token of the conditional expression.
     */
    getColonToken() {
        return this.getNodeFromCompilerNode(this.compilerNode.colonToken);
    }

    /**
     * Gets the when false expression of the conditional expression.
     */
    getWhenFalse() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.whenFalse);
    }
}
