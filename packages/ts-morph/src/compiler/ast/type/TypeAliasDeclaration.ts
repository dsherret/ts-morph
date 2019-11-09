import { ts } from "@ts-morph/common";
import { TypeAliasDeclarationStructure, TypeAliasDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { AmbientableNode, ExportableNode, JSDocableNode, ModifierableNode, NamedNode, TypedNode, TypeParameteredNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Statement } from "../statement";
import { callBaseGetStructure } from "../callBaseGetStructure";

// todo: type node should not be able to return undefined

const createBase = <T extends typeof Statement>(ctor: T) => TypeParameteredNode(TypedNode(JSDocableNode(AmbientableNode(
    ExportableNode(ModifierableNode(NamedNode(ctor)))
))));
export const TypeAliasDeclarationBase = createBase(Statement);
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
            kind: StructureKind.TypeAlias,
            type: this.getTypeNodeOrThrow().getText()
        });
    }
}
