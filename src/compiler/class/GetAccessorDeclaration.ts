import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, StaticableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";

export const GetAccessorDeclarationBase = StaticableNode(FunctionLikeDeclaration(PropertyNamedNode(Node)));
export class GetAccessorDeclaration extends GetAccessorDeclarationBase<ts.GetAccessorDeclaration> {
}
