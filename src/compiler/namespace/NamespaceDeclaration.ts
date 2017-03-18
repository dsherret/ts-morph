import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, AmbientableNode} from "./../base";
import {StatementedNode} from "./../statement";

export const NamespaceDeclarationBase = StatementedNode(AmbientableNode(ExportableNode(NamedNode(Node))));
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
}
