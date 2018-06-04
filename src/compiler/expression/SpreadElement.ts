import { ts } from "../../typescript";
import { Expression } from "./Expression";
import { ExpressionedNode } from "./expressioned";

export const SpreadElementBase = ExpressionedNode(Expression);
export class SpreadElement extends SpreadElementBase<ts.SpreadElement> {
}
