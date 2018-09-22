import { removeOverloadableStatementedNodeChild } from "../../manipulation";
import * as getStructureFuncs from "../../manipulation/helpers/getStructureFunctions";
import { FunctionDeclarationOverloadStructure, FunctionDeclarationStructure, FunctionDeclarationSpecificStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { AmbientableNode, AsyncableNode, BodyableNode, ChildOrderableNode, ExportableNode, GeneratorableNode, ModifierableNode, NameableNode,
    TextInsertableNode, UnwrappableNode, SignaturedDeclaration, TypeParameteredNode, JSDocableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { NamespaceChildableNode } from "../namespace";
import { StatementedNode } from "../statement";
import { FunctionLikeDeclaration } from "./FunctionLikeDeclaration";
import { insertOverloads, OverloadableNode } from "./OverloadableNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const FunctionDeclarationBase = ChildOrderableNode(UnwrappableNode(TextInsertableNode(OverloadableNode(BodyableNode(AsyncableNode(GeneratorableNode(
    FunctionLikeDeclaration(StatementedNode(AmbientableNode(NamespaceChildableNode(ExportableNode(ModifierableNode(NameableNode(Node)))))))
)))))));
export const FunctionDeclarationOverloadBase = ChildOrderableNode(UnwrappableNode(TextInsertableNode(AsyncableNode(GeneratorableNode(ModifierableNode(
    SignaturedDeclaration(StatementedNode(AmbientableNode(NamespaceChildableNode(JSDocableNode(TypeParameteredNode(ExportableNode(ModifierableNode(Node))))))))
))))));

export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
    /**
     * Adds a function overload.
     * @param structure - Structure of the overload.
     */
    addOverload(structure: FunctionDeclarationOverloadStructure) {
        return this.addOverloads([structure])[0];
    }

    /**
     * Adds function overloads.
     * @param structures - Structures of the overloads.
     */
    addOverloads(structures: ReadonlyArray<FunctionDeclarationOverloadStructure>) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }

    /**
     * Inserts a function overload.
     * @param index - Child index to insert at.
     * @param structure - Structure of the overload.
     */
    insertOverload(index: number, structure: FunctionDeclarationOverloadStructure) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts function overloads.
     * @param index - Child index to insert at.
     * @param structure - Structures of the overloads.
     */
    insertOverloads(index: number, structures: ReadonlyArray<FunctionDeclarationOverloadStructure>) {
        const thisName = this.getName();
        const childCodes = structures.map(structure => `function ${thisName}();`);

        return insertOverloads<FunctionDeclaration, FunctionDeclarationOverloadStructure>({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromFunctionDeclarationOverload,
            setNodeFromStructure: (node, structure) => node.set(structure),
            expectedSyntaxKind: SyntaxKind.FunctionDeclaration
        });
    }

    /**
     * Removes this function declaration.
     */
    remove() {
        removeOverloadableStatementedNodeChild(this);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<FunctionDeclarationStructure>) {
        callBaseSet(FunctionDeclarationBase.prototype, this, structure);

        if (structure.overloads != null) {
            this.getOverloads().forEach(o => o.remove());
            this.addOverloads(structure.overloads);
        }

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): FunctionDeclarationStructure | FunctionDeclarationOverloadStructure {
        const isOverload = this.isOverload();
        const hasImplementation = this.getImplementation();
        const basePrototype = isOverload && hasImplementation ? FunctionDeclarationOverloadBase.prototype : FunctionDeclarationBase.prototype;
        const structure = !hasImplementation || isOverload ? {} : { overloads: this.getOverloads().map(o => o.getStructure()) };

        return callBaseGetStructure<any>(basePrototype, this, structure);
    }
}
