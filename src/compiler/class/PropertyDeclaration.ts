import * as errors from "../../errors";
import { removeClassMember } from "../../manipulation";
import { PropertyDeclarationStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { ChildOrderableNode, DecoratableNode, ExclamationTokenableNode, InitializerExpressionableNode, JSDocableNode, ModifierableNode, PropertyNamedNode,
    QuestionTokenableNode, ReadonlyableNode, ScopedNode, StaticableNode, TypedNode } from "../base";
import { callBaseFill } from "../callBaseFill";
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
}
