import { ts } from "../../typescript";
import { AsyncableNode, BodiedNode, GeneratorableNode, JSDocableNode, ModifierableNode, NameableNode, SignaturedDeclaration, TextInsertableNode, TypeParameteredNode } from "../base";
import { PrimaryExpression } from "../expression";
import { StatementedNode } from "../statement";

export const FunctionExpressionBase = JSDocableNode(TextInsertableNode(BodiedNode(AsyncableNode(GeneratorableNode(StatementedNode(
    TypeParameteredNode(SignaturedDeclaration(ModifierableNode(NameableNode(PrimaryExpression)))
)))))));
export class FunctionExpression extends FunctionExpressionBase<ts.FunctionExpression> {
}
