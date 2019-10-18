import { ts } from "@ts-morph/common";
import { UpdateExpression } from "./UpdateExpression";

export class LeftHandSideExpression<T extends ts.LeftHandSideExpression = ts.LeftHandSideExpression> extends UpdateExpression<T> {
}
