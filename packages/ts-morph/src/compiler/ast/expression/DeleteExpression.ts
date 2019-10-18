import { ts } from "@ts-morph/common";
import { UnaryExpressionedNode } from "./expressioned";
import { UnaryExpression } from "./UnaryExpression";

export const DeleteExpressionBase = UnaryExpressionedNode(UnaryExpression);
export class DeleteExpression extends DeleteExpressionBase<ts.DeleteExpression> {
}
