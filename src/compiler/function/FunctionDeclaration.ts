import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, AmbientableNode, DocumentationableNode} from "./../base";
import {StatementedNode} from "./../statement";

export const FunctionDeclarationBase = StatementedNode(DocumentationableNode(AmbientableNode(ExportableNode(NamedNode(Node)))));
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
}
