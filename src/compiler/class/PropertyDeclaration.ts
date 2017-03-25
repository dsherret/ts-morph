import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode, StaticableNode} from "./../base";

export const PropertyDeclarationBase = StaticableNode(DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(PropertyNamedNode(Node)))))));
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
}
