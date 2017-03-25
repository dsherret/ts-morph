import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode} from "./../base";

export const PropertyDeclarationBase = DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(PropertyNamedNode(Node))))));
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
}
