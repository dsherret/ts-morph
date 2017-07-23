import * as ts from "typescript";
import {PropertySignatureStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode, ModifierableNode} from "./../base";

export const PropertySignatureBase = DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(
    PropertyNamedNode(ModifierableNode(Node))
)))));
export class PropertySignature extends PropertySignatureBase<ts.PropertySignature> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<PropertySignatureStructure>) {
        callBaseFill(PropertySignatureBase.prototype, this, structure);

        return this;
    }
}
