import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, AmbientableNode} from "./../base";

export const InterfaceDeclarationBase = AmbientableNode(ExportableNode(NamedNode(Node)));
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
}
