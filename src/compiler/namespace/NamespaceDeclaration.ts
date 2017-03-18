import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportedNode} from "./../base";
import {StatementedNode} from "./../statement";

export const NamespaceDeclarationBase = StatementedNode(ExportedNode(NamedNode(Node)));
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
}
