import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode} from "./../base";

export const PropertyDeclarationBase = ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(PropertyNamedNode(Node)))));
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
}
