import { ts } from "@ts-morph/common";
import { Expression } from "./Expression";
import { ExpressionedNode } from "./expressioned";

export const SpreadElementBase = ExpressionedNode(Expression);
export class SpreadElement extends SpreadElementBase<ts.SpreadElement> {
}
