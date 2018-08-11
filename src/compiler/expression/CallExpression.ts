import { ts } from "../../typescript";
import { ArgumentedNode, TypeArgumentedNode } from "../base";
import { Type } from "../type";
import { LeftHandSideExpressionedNode } from "./expressioned";
import { LeftHandSideExpression } from "./LeftHandSideExpression";

export const CallExpressionBase = TypeArgumentedNode(ArgumentedNode(LeftHandSideExpressionedNode(LeftHandSideExpression)));
export class CallExpression<T extends ts.CallExpression = ts.CallExpression> extends CallExpressionBase<T> {
    /**
     * Gets the return type of the call expression.
     */
    getReturnType(): Type {
        return this.context.typeChecker.getTypeAtLocation(this);
    }
}
