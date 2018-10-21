import { ts } from "../../../typescript";
import { ClassLikeDeclarationBase } from "./base";
import { PrimaryExpression } from "../expression/PrimaryExpression";

export const ClassExpressionBase = ClassLikeDeclarationBase(PrimaryExpression);
export class ClassExpression extends ClassExpressionBase<ts.ClassExpression> {
}
