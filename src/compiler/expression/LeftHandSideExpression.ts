import { ts } from "../../typescript";
import { UpdateExpression } from "./UpdateExpression";

export class LeftHandSideExpression<T extends ts.LeftHandSideExpression = ts.LeftHandSideExpression> extends UpdateExpression<T> {
}
