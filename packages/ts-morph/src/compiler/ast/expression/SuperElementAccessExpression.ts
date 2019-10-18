import { ts } from "@ts-morph/common";
import { ElementAccessExpression } from "./ElementAccessExpression";
import { SuperExpressionedNode } from "./expressioned";

export const SuperElementAccessExpressionBase = SuperExpressionedNode(ElementAccessExpression);
export class SuperElementAccessExpression extends SuperElementAccessExpressionBase<ts.SuperElementAccessExpression> {
}
