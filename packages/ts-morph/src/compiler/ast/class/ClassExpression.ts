import { ts } from "@ts-morph/common";
import { PrimaryExpression } from "../expression/PrimaryExpression";
import { ClassLikeDeclarationBase } from "./base";

export const ClassExpressionBase = ClassLikeDeclarationBase(PrimaryExpression);
export class ClassExpression extends ClassExpressionBase<ts.ClassExpression> {
}
