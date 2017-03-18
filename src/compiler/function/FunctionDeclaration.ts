import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode} from "./../base";

export const FunctionDeclarationBase = NamedNode(Node);
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
}
