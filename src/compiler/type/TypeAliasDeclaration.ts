import { TypeAliasDeclarationStructure, TypeAliasDeclarationSpecificStructure } from "../../structures";
import { ts } from "../../typescript";
import { AmbientableNode, ChildOrderableNode, ExportableNode, JSDocableNode, ModifierableNode, NamedNode, TypedNode,
    TypeParameteredNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Statement } from "../statement";
import { callBaseGetStructure } from "../callBaseGetStructure";

// todo: type node should not be able to return undefined
export const TypeAliasDeclarationBase = ChildOrderableNode(TypeParameteredNode(TypedNode(JSDocableNode(AmbientableNode(
    ExportableNode(ModifierableNode(NamedNode(Statement)))
)))));
export class TypeAliasDeclaration extends TypeAliasDeclarationBase<ts.TypeAliasDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<TypeAliasDeclarationStructure>) {
        callBaseSet(TypeAliasDeclarationBase.prototype, this, structure);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): TypeAliasDeclarationStructure {
        return callBaseGetStructure<TypeAliasDeclarationSpecificStructure>(TypeAliasDeclarationBase.prototype, this, {
            type: this.getTypeNodeOrThrow().getText()
        });
    }
}
