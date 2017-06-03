import * as ts from "typescript";
import {Node} from "./../common";
import {ScopedNode, BodyableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";

export const ConstructorDeclarationBase = ScopedNode(FunctionLikeDeclaration(BodyableNode(Node)));
export class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
}
