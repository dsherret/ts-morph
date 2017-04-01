import * as ts from "typescript";
import {Node} from "./../common";
import {FunctionLikeDeclaration} from "./../function";
import {ScopedNode} from "./../base";

export const ConstructorDeclarationBase = ScopedNode(FunctionLikeDeclaration(Node));
export class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
}
