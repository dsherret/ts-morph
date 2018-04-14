import { ts } from "../../typescript";
import { MemberExpression } from "./MemberExpression";

export class PrimaryExpression<T extends ts.PrimaryExpression = ts.PrimaryExpression> extends MemberExpression<T> {
}
