import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportedNode} from "./../base";
import {StatementedNode} from "./../statement";

export const FunctionDeclarationBase = StatementedNode(ExportedNode(NamedNode(Node)));
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
}
