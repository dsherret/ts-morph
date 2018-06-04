import { ts } from "../../typescript";
import { TypedNode } from "../base";
import { Expression } from "./Expression";
import { ExpressionedNode } from "./expressioned";

export const AsExpressionBase = TypedNode(ExpressionedNode(Expression));
export class AsExpression extends AsExpressionBase<ts.AsExpression> {
}
