import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode} from "./../base";

export const PropertySignatureBase = DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(PropertyNamedNode(Node))))));
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
}
