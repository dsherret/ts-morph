import { ts } from "@ts-morph/common";
import { TypedNode } from "../base";
import { UnaryExpressionedNode } from "./expressioned";
import { UnaryExpression } from "./UnaryExpression";

const createBase = <T extends typeof UnaryExpression>(ctor: T) => TypedNode(UnaryExpressionedNode(ctor));
export const TypeAssertionBase = createBase(UnaryExpression);
export class TypeAssertion extends TypeAssertionBase<ts.TypeAssertion> {
}
