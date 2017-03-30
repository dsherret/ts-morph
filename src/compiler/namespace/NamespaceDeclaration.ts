import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode} from "./../base";
import {StatementedNode} from "./../statement";

export const NamespaceDeclarationBase = StatementedNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(NamedNode(Node))))));
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
}
