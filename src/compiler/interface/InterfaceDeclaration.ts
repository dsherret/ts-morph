import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode} from "./../base";

export const InterfaceDeclarationBase = NamedNode(Node);
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
}
