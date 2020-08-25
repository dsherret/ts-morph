import { ts } from "@ts-morph/common";
import { DotDotDotTokenableNode } from "../base";
import { Expression, ExpressionableNode } from "../expression";

export const JsxExpressionBase = ExpressionableNode(DotDotDotTokenableNode(Expression));
export class JsxExpression extends JsxExpressionBase<ts.JsxExpression> {
}
