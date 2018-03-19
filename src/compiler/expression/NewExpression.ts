import {ts} from "../../typescript";
import {LeftHandSideExpressionedNode} from "./expressioned";
import {Node} from "../common";
import {PrimaryExpression} from "./PrimaryExpression";
import {ArgumentedNode, TypeArgumentedNode} from "../base";

export const NewExpressionBase = TypeArgumentedNode(ArgumentedNode(LeftHandSideExpressionedNode(PrimaryExpression)));
export class NewExpression extends NewExpressionBase<ts.NewExpression> {
}
