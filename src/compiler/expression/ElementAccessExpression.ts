import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {Expression} from "./Expression";
import {MemberExpression} from "./MemberExpression";
import {LeftHandSideExpressionedNode} from "./expressioned";

export const ElementAccessExpressionBase = LeftHandSideExpressionedNode(MemberExpression);
export class ElementAccessExpression<T extends ts.ElementAccessExpression = ts.ElementAccessExpression> extends ElementAccessExpressionBase<T> {
    /**
     * Gets this element access expression's argument expression or undefined if none exists.
     */
    getArgumentExpression() {
        return this.getNodeFromCompilerNodeIfExists<Expression>(this.compilerNode.argumentExpression);
    }

    /**
     * Gets this element access expression's argument expression or throws if none exists.
     */
    getArgumentExpressionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getArgumentExpression(), "Expected to find an argument expression.");
    }
}
