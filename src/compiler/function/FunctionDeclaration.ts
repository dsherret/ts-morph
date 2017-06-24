import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ModifierableNode, ExportableNode, AmbientableNode, AsyncableNode, GeneratorableNode, BodyableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {NamespaceChildableNode} from "./../namespace";
import {FunctionLikeDeclaration} from "./FunctionLikeDeclaration";

export const FunctionDeclarationBase = AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(StatementedNode(AmbientableNode(
    NamespaceChildableNode(ExportableNode(ModifierableNode(BodyableNode(NamedNode(Node)))))
)))));
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
}
