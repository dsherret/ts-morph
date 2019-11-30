import { ts } from "@ts-morph/common";
import { Type } from "../../types";
import { ArgumentedNode, QuestionDotTokenableNode, TypeArgumentedNode } from "../base";
import { LeftHandSideExpressionedNode } from "./expressioned";
import { LeftHandSideExpression } from "./LeftHandSideExpression";

const createBase = <T extends typeof LeftHandSideExpression>(ctor: T) => TypeArgumentedNode(ArgumentedNode(
    QuestionDotTokenableNode(LeftHandSideExpressionedNode(ctor))
));
export const CallExpressionBase = createBase(LeftHandSideExpression);
export class CallExpression<T extends ts.CallExpression = ts.CallExpression> extends CallExpressionBase<T> {
    /**
     * Gets the return type of the call expression.
     */
    getReturnType(): Type {
        return this._context.typeChecker.getTypeAtLocation(this);
    }
}
