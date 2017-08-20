import * as ts from "typescript";
import * as errors from "./../../errors";
import {PropertyDeclarationStructure} from "./../../structures";
import {removeClassMember, removeInterfaceMember} from "./../../manipulation";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {PropertyNamedNode, TypedNode, InitializerExpressionableNode, QuestionTokenableNode, ReadonlyableNode, DocumentationableNode, StaticableNode,
    ModifierableNode, ScopedNode, DecoratableNode} from "./../base";
import {ClassDeclaration} from "./ClassDeclaration";
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

    /**
     * Removes the property.
     */
    remove() {
        const parent = this.getParentOrThrow();

        switch (parent.getKind()) {
            case ts.SyntaxKind.ClassDeclaration:
                removeClassMember(this);
                break;
            default:
                throw new errors.NotImplementedError(`Not implemented parent syntax kind: ${parent.getKindName()}`);
        }
    }
}
