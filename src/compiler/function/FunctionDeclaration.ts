import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ModifierableNode, ExportableNode, AmbientableNode, AsyncableNode, GeneratorableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {FunctionLikeDeclaration} from "./FunctionLikeDeclaration";

export const FunctionDeclarationBase = AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(StatementedNode(AmbientableNode(
    ExportableNode(ModifierableNode(NamedNode(Node)))
)))));
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
}
