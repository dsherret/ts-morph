import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, StaticableNode, AsyncableNode, GeneratorableNode, ScopedNode, DecoratableNode} from "./../base";
import {FunctionLikeDeclaration} from "./../function";
import {AbstractableNode} from "./base";

export const MethodDeclarationBase = DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(
    PropertyNamedNode(Node)
)))))));
export class MethodDeclaration extends MethodDeclarationBase<ts.MethodDeclaration> {
}
