import { ts } from "../../typescript";
import { LiteralLikeNode } from "../base";
import { PrimaryExpression } from "./PrimaryExpression";

export const LiteralExpressionBase = LiteralLikeNode(PrimaryExpression);
export class LiteralExpression<T extends ts.LiteralExpression = ts.LiteralExpression> extends LiteralExpressionBase<T> {
}
