import * as ts from "typescript";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode} from "./../base";

export const PropertySignatureBase = ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(PropertyNamedNode(Node)))));
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
}
