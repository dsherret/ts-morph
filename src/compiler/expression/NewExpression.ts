import { ts } from "../../typescript";
import { ArgumentedNode, TypeArgumentedNode } from "../base";
import { LeftHandSideExpressionedNode } from "./expressioned";
import { PrimaryExpression } from "./PrimaryExpression";

export const NewExpressionBase = TypeArgumentedNode(ArgumentedNode(LeftHandSideExpressionedNode(PrimaryExpression)));
export class NewExpression extends NewExpressionBase<ts.NewExpression> {
}
