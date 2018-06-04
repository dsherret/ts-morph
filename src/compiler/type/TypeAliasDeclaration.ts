import { TypeAliasDeclarationStructure } from "../../structures";
import { ts } from "../../typescript";
import { AmbientableNode, ChildOrderableNode, ExportableNode, JSDocableNode, ModifierableNode, NamedNode, TypedNode, TypeParameteredNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Statement } from "../statement";

// todo: type node should not be able to return undefined
export const TypeAliasDeclarationBase = ChildOrderableNode(TypeParameteredNode(TypedNode(JSDocableNode(AmbientableNode(
    ExportableNode(ModifierableNode(NamedNode(Statement)))
)))));
export class TypeAliasDeclaration extends TypeAliasDeclarationBase<ts.TypeAliasDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<TypeAliasDeclarationStructure>) {
        callBaseFill(TypeAliasDeclarationBase.prototype, this, structure);

        return this;
    }
}
