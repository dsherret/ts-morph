import * as ts from "typescript";
import {Node} from "./../common";
import {InitializerExpressionableNode, BindingNamedNode, TypedNode} from "./../base";

export const VariableDeclarationBase = TypedNode(InitializerExpressionableNode(BindingNamedNode(Node)));
export class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
}
