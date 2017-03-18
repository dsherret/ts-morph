import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode} from "./../base";
import {StatementedNode} from "./../statement";

export const NamespaceDeclarationBase = StatementedNode(NamedNode(Node));
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
}
