import { ts } from "@ts-morph/common";
import { DotDotDotTokenableNode } from "../base";
import { Expression, ExpressionableNode } from "../expression";

const createBase = <T extends typeof Expression>(ctor: T) => ExpressionableNode(DotDotDotTokenableNode(ctor));
export const JsxExpressionBase = createBase(Expression);
export class JsxExpression extends JsxExpressionBase<ts.JsxExpression> {
}
