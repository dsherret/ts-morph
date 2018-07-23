import { TypeAliasDeclarationStructure, TypeAliasDeclarationSpecificStructure } from "../../structures";
import { ts } from "../../typescript";
import {
    AmbientableNode, ChildOrderableNode, ExportableNode, JSDocableNode, ModifierableNode, NamedNode, TypedNode,
    TypeParameteredNode
} from "../base";
import { callBaseFill } from "../callBaseFill";
import { Statement } from "../statement";
import { callBaseGetStructure } from "../callBaseGetStructure";

// todo: type node should not be able to return undefined
export const TypeAliasDeclarationBase = ChildOrderableNode(TypeParameteredNode(TypedNode(JSDocableNode(AmbientableNode(
    ExportableNode(ModifierableNode(NamedNode(Statement)))
)))));
export class TypeAliasDeclaration extends TypeAliasDeclarationBase<ts.TypeAliasDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<TypeAliasDeclarationStructure>): this {
        callBaseFill(TypeAliasDeclarationBase.prototype, this, structure);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): TypeAliasDeclarationStructure {
        return callBaseGetStructure<TypeAliasDeclarationSpecificStructure>(TypeAliasDeclarationBase.prototype, this, {
            type: this.getType().getText()
        });
    }
}
