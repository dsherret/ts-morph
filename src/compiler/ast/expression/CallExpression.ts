import { ts } from "../../../typescript";
import { Type } from "../../types";
import { ArgumentedNode, TypeArgumentedNode } from "../base";
import { LeftHandSideExpressionedNode } from "./expressioned";
import { LeftHandSideExpression } from "./LeftHandSideExpression";

const createCallExpressionBase = <T extends typeof LeftHandSideExpression>(ctor: T) => TypeArgumentedNode(ArgumentedNode(
    LeftHandSideExpressionedNode(ctor)
));
export const CallExpressionBase = createCallExpressionBase(LeftHandSideExpression);
export class CallExpression<T extends ts.CallExpression = ts.CallExpression> extends CallExpressionBase<T> {
    /**
     * Gets the return type of the call expression.
     */
    getReturnType(): Type {
        return this._context.typeChecker.getTypeAtLocation(this);
    }
}
