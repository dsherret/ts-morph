import {ts} from "./../../typescript";
import {UnaryExpression} from "./UnaryExpression";
import {Expression} from "./Expression";
import {UnaryExpressionedNode} from "./expressioned";
import {TypedNode} from "./../base";

export const TypeAssertionBase = TypedNode(UnaryExpressionedNode(UnaryExpression));
export class TypeAssertion extends TypeAssertionBase<ts.TypeAssertion> {
}
