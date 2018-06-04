import { ts } from "../../typescript";
import { NamedNode } from "../base";
import { LeftHandSideExpressionedNode } from "./expressioned";
import { MemberExpression } from "./MemberExpression";

export const PropertyAccessExpressionBase = NamedNode(LeftHandSideExpressionedNode(MemberExpression));
export class PropertyAccessExpression<T extends ts.PropertyAccessExpression = ts.PropertyAccessExpression> extends PropertyAccessExpressionBase<T> {
}
