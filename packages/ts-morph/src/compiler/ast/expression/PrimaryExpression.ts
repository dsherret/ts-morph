import { ts } from "@ts-morph/common";
import { MemberExpression } from "./MemberExpression";

export class PrimaryExpression<T extends ts.PrimaryExpression = ts.PrimaryExpression> extends MemberExpression<T> {
}
