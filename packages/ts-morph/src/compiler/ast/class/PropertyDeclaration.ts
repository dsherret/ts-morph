import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { PropertyDeclarationSpecificStructure, PropertyDeclarationStructure, StructureKind } from "../../../structures";
import { ChildOrderableNode, AmbientableNode, DecoratableNode, ExclamationTokenableNode, InitializerExpressionableNode, JSDocableNode, ModifierableNode,
    PropertyNamedNode, QuestionTokenableNode, ReadonlyableNode, ScopedNode, StaticableNode, TypedNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { AbstractableNode } from "./base";
import { ClassElement } from "./ClassElement";

const createBase = <T extends typeof ClassElement>(ctor: T) => ChildOrderableNode(AmbientableNode(DecoratableNode(AbstractableNode(ScopedNode(
    StaticableNode(JSDocableNode(ReadonlyableNode(ExclamationTokenableNode(QuestionTokenableNode(InitializerExpressionableNode(
        TypedNode(PropertyNamedNode(ModifierableNode(ctor)))
    ))))))
)))));
export const PropertyDeclarationBase = createBase(ClassElement);
export class PropertyDeclaration extends PropertyDeclarationBase<ts.PropertyDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<PropertyDeclarationStructure>) {
        callBaseSet(PropertyDeclarationBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes the property.
     */
    remove() {
        const parent = this.getParentOrThrow();

        switch (parent.getKind()) {
            case SyntaxKind.ClassDeclaration:
                super.remove();
                break;
            default:
                throw new errors.NotImplementedError(`Not implemented parent syntax kind: ${parent.getKindName()}`);
        }
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): PropertyDeclarationStructure {
        return callBaseGetStructure<PropertyDeclarationSpecificStructure>(PropertyDeclarationBase.prototype, this, {
            kind: StructureKind.Property
        }) as any as PropertyDeclarationStructure;
    }
}
