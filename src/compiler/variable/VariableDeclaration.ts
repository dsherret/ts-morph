import * as ts from "typescript";
import {Node} from "./../common";
import {InitializerExpressionedNode, BindingNamedNode} from "./../base";

export class VariableDeclaration extends InitializerExpressionedNode(BindingNamedNode(Node))<ts.VariableDeclaration> {
}
