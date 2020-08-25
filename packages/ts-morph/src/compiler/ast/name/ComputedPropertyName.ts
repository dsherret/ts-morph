import { ts } from "@ts-morph/common";
import { Node } from "../common";
import { ExpressionedNode } from "../expression";

export const ComputedPropertyNameBase = ExpressionedNode(Node);
export class ComputedPropertyName extends ComputedPropertyNameBase<ts.ComputedPropertyName> {
}
