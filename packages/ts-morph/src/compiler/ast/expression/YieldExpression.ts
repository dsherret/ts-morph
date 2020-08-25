import { ts } from "@ts-morph/common";
import { GeneratorableNode } from "../base";
import { Expression } from "./Expression";
import { ExpressionableNode } from "./expressioned";

export const YieldExpressionBase = ExpressionableNode(GeneratorableNode(Expression));
export class YieldExpression extends YieldExpressionBase<ts.YieldExpression> {
}
