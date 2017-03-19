import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, AmbientableNode, DocumentationableNode} from "./../base";

export const InterfaceDeclarationBase = DocumentationableNode(AmbientableNode(ExportableNode(NamedNode(Node))));
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
}
