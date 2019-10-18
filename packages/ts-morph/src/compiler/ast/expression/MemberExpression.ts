import { ts } from "@ts-morph/common";
import { LeftHandSideExpression } from "./LeftHandSideExpression";

export class MemberExpression<T extends ts.MemberExpression = ts.MemberExpression> extends LeftHandSideExpression<T> {
}
