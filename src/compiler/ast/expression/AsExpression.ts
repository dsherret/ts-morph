import { ts } from "../../../typescript";
import { TypedNode } from "../base";
import { Expression } from "./Expression";
import { ExpressionedNode } from "./expressioned";

const createAsExpressionBase = <T extends typeof Expression>(ctor: T) => TypedNode(ExpressionedNode(ctor));
export const AsExpressionBase = createAsExpressionBase(Expression);
export class AsExpression extends AsExpressionBase<ts.AsExpression> {
}
