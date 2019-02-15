import { ts } from "../../../typescript";
import { AsyncableNode, BodiedNode, GeneratorableNode, JSDocableNode, ModifierableNode, NameableNode, SignatureDeclaration, TextInsertableNode, TypeParameteredNode } from "../base";
import { PrimaryExpression } from "../expression";
import { StatementedNode } from "../statement";

export const FunctionExpressionBase = JSDocableNode(TextInsertableNode(BodiedNode(AsyncableNode(GeneratorableNode(StatementedNode(
    TypeParameteredNode(SignatureDeclaration(ModifierableNode(NameableNode(PrimaryExpression)))
)))))));
export class FunctionExpression extends FunctionExpressionBase<ts.FunctionExpression> {
}
