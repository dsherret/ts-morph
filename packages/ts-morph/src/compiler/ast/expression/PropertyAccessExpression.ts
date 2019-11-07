import { ts } from "@ts-morph/common";
import { NamedNode } from "../base";
import { LeftHandSideExpressionedNode } from "./expressioned";
import { MemberExpression } from "./MemberExpression";

const createPropertyAccessExpressionBase = <T extends typeof MemberExpression>(ctor: T) => NamedNode(LeftHandSideExpressionedNode(ctor));
export const PropertyAccessExpressionBase = createPropertyAccessExpressionBase(MemberExpression);
export class PropertyAccessExpression<T extends ts.PropertyAccessExpression = ts.PropertyAccessExpression> extends PropertyAccessExpressionBase<T> {
}
