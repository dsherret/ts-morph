import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";

export const MethodDeclarationBase = FunctionLikeDeclaration(PropertyNamedNode(Node));
export class MethodDeclaration extends MethodDeclarationBase<ts.MethodDeclaration> {
}
