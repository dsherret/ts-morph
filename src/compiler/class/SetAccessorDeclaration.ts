import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, StaticableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";

export const SetAccessorDeclarationBase = StaticableNode(FunctionLikeDeclaration(PropertyNamedNode(Node)));
export class SetAccessorDeclaration extends SetAccessorDeclarationBase<ts.SetAccessorDeclaration> {
}
