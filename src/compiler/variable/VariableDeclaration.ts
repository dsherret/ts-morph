import * as ts from "typescript";
import {Node} from "./../common";
import {InitializerExpressionedNode, BindingNamedNode} from "./../base";

export const VariableDeclarationBase = InitializerExpressionedNode(BindingNamedNode(Node));
export class VariableDeclaration extends VariableDeclarationBase<ts.VariableDeclaration> {
}
