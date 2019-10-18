import { ts } from "@ts-morph/common";
import { UnaryExpression } from "./UnaryExpression";

export class UpdateExpression<T extends ts.UpdateExpression = ts.UpdateExpression> extends UnaryExpression<T> {
}
