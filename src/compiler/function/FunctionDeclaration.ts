import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, AmbientableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {FunctionLikeDeclaration} from "./FunctionLikeDeclaration";

export const FunctionDeclarationBase = FunctionLikeDeclaration(StatementedNode(AmbientableNode(ExportableNode(NamedNode(Node)))));
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
}
