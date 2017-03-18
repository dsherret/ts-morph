import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode} from "./../base";

export const NamespaceDeclarationBase = NamedNode(Node);
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
}
