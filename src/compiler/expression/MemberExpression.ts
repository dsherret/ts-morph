import { ts } from "../../typescript";
import { LeftHandSideExpression } from "./LeftHandSideExpression";

export class MemberExpression<T extends ts.MemberExpression = ts.MemberExpression> extends LeftHandSideExpression<T> {
}
