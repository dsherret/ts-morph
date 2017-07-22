import * as ts from "typescript";
import {PropertyDeclarationStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode, StaticableNode,
    ModifierableNode, ScopedNode, DecoratableNode} from "./../base";
import {AbstractableNode} from "./base";

export const PropertyDeclarationBase = DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(DocumentationableNode(ReadonlyableNode(QuestionTokenableNode(
    InitializerExpressionableNode(TypedNode(PropertyNamedNode(ModifierableNode(Node))))
)))))));
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<PropertyDeclarationStructure>) {
        callBaseFill(PropertyDeclarationBase.prototype, this, structure);

        return this;
    }
}
