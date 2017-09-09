import * as ts from "typescript";
import {TypeAliasDeclarationStructure} from "./../../structures";
import {removeStatementedNodeChild} from "./../../manipulation";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {NamedNode, TypedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode, TypeParameteredNode} from "./../base";

// todo: type node should not be able to return undefined
export const TypeAliasDeclarationBase = TypeParameteredNode(TypedNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(NamedNode(Node)))))));
export class TypeAliasDeclaration extends TypeAliasDeclarationBase<ts.TypeAliasDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<TypeAliasDeclarationStructure>) {
        callBaseFill(TypeAliasDeclarationBase.prototype, this, structure);

        return this;
    }

    /**
     * Removes this type alias declaration.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
