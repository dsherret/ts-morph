import * as ts from "typescript";
import {NamedNode} from "./../base";
import {Node} from "./../common";
import {MemberExpression} from "./MemberExpression";
import {LeftHandSideExpression} from "./LeftHandSideExpression";
import {LeftHandSideExpressionedNode} from "./expressioned";

export const PropertyAccessExpressionBase = NamedNode(LeftHandSideExpressionedNode(MemberExpression));
export class PropertyAccessExpression<T extends ts.PropertyAccessExpression = ts.PropertyAccessExpression> extends PropertyAccessExpressionBase<T> {
}
