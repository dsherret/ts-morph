import {ts} from "../../typescript";
import {PrimaryExpression} from "../expression";
import {JSDocableNode, NameableNode, ModifierableNode, AsyncableNode, GeneratorableNode, BodiedNode, TextInsertableNode, TypeParameteredNode,
    SignaturedDeclaration} from "../base";
import {StatementedNode} from "../statement";

export const FunctionExpressionBase = JSDocableNode(TextInsertableNode(BodiedNode(AsyncableNode(GeneratorableNode(StatementedNode(
    TypeParameteredNode(SignaturedDeclaration(ModifierableNode(NameableNode(PrimaryExpression)))
)))))));
export class FunctionExpression extends FunctionExpressionBase<ts.FunctionExpression> {
}
