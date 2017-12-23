import * as ts from "typescript";
import {Expression} from "./../common";
import {JSDocableNode, NameableNode, ModifierableNode, AsyncableNode, GeneratorableNode, BodiedNode, TextInsertableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {SignaturedDeclaration} from "./SignaturedDeclaration";

export const FunctionExpressionBase = JSDocableNode(TextInsertableNode(BodiedNode(AsyncableNode(GeneratorableNode(StatementedNode(
    SignaturedDeclaration(ModifierableNode(NameableNode(Expression))
)))))));
export class FunctionExpression extends FunctionExpressionBase<ts.FunctionExpression> {
}
