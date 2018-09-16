import { InterfaceDeclarationStructure, InterfaceDeclarationSpecificStructure } from "../../structures";
import { ts } from "../../typescript";
import { ArrayUtils } from "../../utils";
import { AmbientableNode, ChildOrderableNode, ExportableNode, ExtendsClauseableNode, HeritageClauseableNode, JSDocableNode, ModifierableNode, NamedNode,
    TextInsertableNode, TypeElementMemberedNode, TypeParameteredNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { ClassDeclaration } from "../class";
import { NamespaceChildableNode } from "../namespace";
import { Statement } from "../statement";
import { ImplementationLocation } from "../tools";
import { Type, TypeAliasDeclaration } from "../type";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const InterfaceDeclarationBase = TypeElementMemberedNode(ChildOrderableNode(TextInsertableNode(ExtendsClauseableNode(HeritageClauseableNode(
    TypeParameteredNode(JSDocableNode(AmbientableNode(NamespaceChildableNode(ExportableNode(ModifierableNode(NamedNode(Statement)))))))
)))));
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
    /**
     * Gets the base types.
     */
    getBaseTypes(): Type[] {
        return this.getType().getBaseTypes();
    }

    /**
     * Gets the base declarations.
     */
    getBaseDeclarations(): (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[] {
        return ArrayUtils.flatten(this.getType().getBaseTypes().map(t => {
            const symbol = t.getSymbol();
            return symbol == null ? [] : (symbol.getDeclarations() as (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[]);
        }));
    }

    /**
     * Gets all the implementations of the interface.
     *
     * This is similar to "go to implementation."
     */
    getImplementations(): ImplementationLocation[] {
        return this.getNameNode().getImplementations();
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<InterfaceDeclarationStructure>) {
        callBaseSet(InterfaceDeclarationBase.prototype, this, structure);
        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): InterfaceDeclarationStructure {
        return callBaseGetStructure<InterfaceDeclarationSpecificStructure>(InterfaceDeclarationBase.prototype, this, {
        });
    }
}
