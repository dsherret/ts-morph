import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, StaticableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";
import {ScopedNode} from "./base";

export const GetAccessorDeclarationBase = ScopedNode(StaticableNode(FunctionLikeDeclaration(PropertyNamedNode(Node))));
export class GetAccessorDeclaration extends GetAccessorDeclarationBase<ts.GetAccessorDeclaration> {
}
