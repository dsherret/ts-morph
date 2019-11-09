import { ArrayUtils, ts } from "@ts-morph/common";
import { InterfaceDeclarationStructure, InterfaceDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { AmbientableNode, ExportableNode, ExtendsClauseableNode, HeritageClauseableNode, JSDocableNode, ModifierableNode, NamedNode, TextInsertableNode,
    TypeElementMemberedNode, TypeParameteredNode } from "../base";
import { Type } from "../../types";
import { callBaseSet } from "../callBaseSet";
import { ClassDeclaration } from "../class";
import { NamespaceChildableNode } from "../module";
import { Statement } from "../statement";
import { ImplementationLocation } from "../../tools";
import { TypeAliasDeclaration } from "../type";
import { callBaseGetStructure } from "../callBaseGetStructure";

const createBase = <T extends typeof Statement>(ctor: T) => TypeElementMemberedNode(TextInsertableNode(
    ExtendsClauseableNode(HeritageClauseableNode(TypeParameteredNode(JSDocableNode(AmbientableNode(
        NamespaceChildableNode(ExportableNode(ModifierableNode(NamedNode(ctor))))
    )))))
));
export const InterfaceDeclarationBase = createBase(Statement);
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
            return (t.getSymbol()?.getDeclarations() as (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[]) ?? [];
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
            kind: StructureKind.Interface
        });
    }
}
