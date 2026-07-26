import { ts } from "@ts-morph/common";
import { GeneratorableNode } from "../base";
import { Expression } from "./Expression";
import { ExpressionableNode } from "./expressioned";

const createBase = <T extends typeof Expression>(ctor: T) => ExpressionableNode(GeneratorableNode(ctor));
export const YieldExpressionBase = createBase(Expression);
export class YieldExpression extends YieldExpressionBase<ts.YieldExpression> {
}
