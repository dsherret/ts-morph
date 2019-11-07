import { ts } from "@ts-morph/common";
import { ArgumentedNode, TypeArgumentedNode } from "../base";
import { LeftHandSideExpressionedNode } from "./expressioned";
import { PrimaryExpression } from "./PrimaryExpression";

const createNewExpressionBase = <T extends typeof PrimaryExpression>(ctor: T) => TypeArgumentedNode(ArgumentedNode(
    LeftHandSideExpressionedNode(ctor)
));
export const NewExpressionBase = createNewExpressionBase(PrimaryExpression);
export class NewExpression extends NewExpressionBase<ts.NewExpression> {
}
