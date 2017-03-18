import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode} from "./../base";
import {StatementedNode} from "./../statement";

export const FunctionDeclarationBase = StatementedNode(NamedNode(Node));
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
}
