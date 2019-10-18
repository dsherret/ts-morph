import { ts } from "@ts-morph/common";
import { Expression } from "./Expression";

export class UnaryExpression<T extends ts.UnaryExpression = ts.UnaryExpression> extends Expression<T> {
}
