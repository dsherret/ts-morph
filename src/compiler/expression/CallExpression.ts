import {ts} from "../../typescript";
import {Expression} from "./Expression";
import {ArgumentedNode, TypeArgumentedNode} from "../base";
import {LeftHandSideExpression} from "./LeftHandSideExpression";
import {LeftHandSideExpressionedNode} from "./expressioned";
import {Node} from "../common";
import {Type} from "../type";

export const CallExpressionBase = TypeArgumentedNode(ArgumentedNode(LeftHandSideExpressionedNode(LeftHandSideExpression)));
export class CallExpression<T extends ts.CallExpression = ts.CallExpression> extends CallExpressionBase<T> {
    /**
     * Gets the return type of the call expression.
     */
    getReturnType(): Type {
        return this.global.typeChecker.getTypeAtLocation(this);
    }
}
