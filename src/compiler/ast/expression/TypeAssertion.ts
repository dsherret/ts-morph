import { ts } from "../../../typescript";
import { TypedNode } from "../base";
import { UnaryExpressionedNode } from "./expressioned";
import { UnaryExpression } from "./UnaryExpression";

const createTypeAssertionBase = <T extends typeof UnaryExpression>(ctor: T) => TypedNode(UnaryExpressionedNode(ctor));
export const TypeAssertionBase = createTypeAssertionBase(UnaryExpression);
export class TypeAssertion extends TypeAssertionBase<ts.TypeAssertion> {
}
