import { ts } from "../../typescript";
import { Expression } from "./Expression";

export class UnaryExpression<T extends ts.UnaryExpression = ts.UnaryExpression> extends Expression<T> {
}
