import { ts } from "@ts-morph/common";
import { TypedNode } from "../base";
import { UnaryExpressionedNode } from "./expressioned";
import { UnaryExpression } from "./UnaryExpression";

export const TypeAssertionBase = TypedNode(UnaryExpressionedNode(UnaryExpression));
export class TypeAssertion extends TypeAssertionBase<ts.TypeAssertion> {
}
