import * as errors from "../../errors";
import { removeClassMember } from "../../manipulation";
import { PropertyDeclarationSpecificStructure, PropertyDeclarationStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { ChildOrderableNode, DecoratableNode, ExclamationTokenableNode, InitializerExpressionableNode, JSDocableNode, ModifierableNode,
    PropertyNamedNode, QuestionTokenableNode, ReadonlyableNode, ScopedNode, StaticableNode, TypedNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { Node } from "../common";
import { AbstractableNode } from "./base";

export const PropertyDeclarationBase = ChildOrderableNode(DecoratableNode(AbstractableNode(ScopedNode(StaticableNode(JSDocableNode(
    ReadonlyableNode(ExclamationTokenableNode(QuestionTokenableNode(InitializerExpressionableNode(TypedNode(PropertyNamedNode(ModifierableNode(Node)))))))
))))));
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<PropertyDeclarationStructure>) {
        callBaseFill(PropertyDeclarationBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes the property.
     */
    remove() {
        const parent = this.getParentOrThrow();

        switch (parent.getKind()) {
            case SyntaxKind.ClassDeclaration:
                removeClassMember(this);
                break;
            default:
                throw new errors.NotImplementedError(`Not implemented parent syntax kind: ${parent.getKindName()}`);
        }
    }

    /**
     * Gets the structure equivalent to this node
     */
    getStructure(): PropertyDeclarationStructure {
        return callBaseGetStructure<PropertyDeclarationSpecificStructure>(PropertyDeclarationBase.prototype, this, {

        }) as any as PropertyDeclarationStructure; // TODO: might need to add this assertion... I'll make it better later
    }
}
