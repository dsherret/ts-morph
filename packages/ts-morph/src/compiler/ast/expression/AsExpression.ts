import { ts } from "@ts-morph/common";
import { TypedNode } from "../base";
import { Expression } from "./Expression";
import { ExpressionedNode } from "./expressioned";

const createBase = <T extends typeof Expression>(ctor: T) => TypedNode(ExpressionedNode(ctor));
export const AsExpressionBase = createBase(Expression);
export class AsExpression extends AsExpressionBase<ts.AsExpression> {
}
