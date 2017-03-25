import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, StaticableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";

export const MethodDeclarationBase = StaticableNode(FunctionLikeDeclaration(PropertyNamedNode(Node)));
export class MethodDeclaration extends MethodDeclarationBase<ts.MethodDeclaration> {
}
