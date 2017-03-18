import * as ts from "typescript";
import {Node} from "./../common";
import {InitializerExpressionedNode, BindingNamedNode, TypedNode} from "./../base";

export const VariableDeclarationBase = TypedNode(InitializerExpressionedNode(BindingNamedNode(Node)));
export class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
}
