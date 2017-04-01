import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, StaticableNode, AsyncableNode, GeneratorableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";
import {AbstractableNode, ScopedNode} from "./base";

export const MethodDeclarationBase = AbstractableNode(ScopedNode(StaticableNode(AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(PropertyNamedNode(Node)))))));
export class MethodDeclaration extends MethodDeclarationBase<ts.MethodDeclaration> {
}
