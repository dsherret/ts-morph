import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode, ModifierableNode} from "./../base";

export const PropertySignatureBase = DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(
    PropertyNamedNode(ModifierableNode(Node))
)))));
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
}
