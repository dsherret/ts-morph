import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportedNode} from "./../base";

export const InterfaceDeclarationBase = NamedNode(ExportedNode(Node));
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
}
