import { ts } from "../../typescript";
import { UnaryExpression } from "./UnaryExpression";
import { Expression } from "./Expression";
import { UnaryExpressionedNode } from "./expressioned";

export const DeleteExpressionBase = UnaryExpressionedNode(UnaryExpression);
export class DeleteExpression extends DeleteExpressionBase<ts.DeleteExpression> {
}
