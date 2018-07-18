import { removeOverloadableStatementedNodeChild } from "../../manipulation";
import * as getStructureFuncs from "../../manipulation/helpers/getStructureFunctions";
import { FunctionDeclarationOverloadStructure, FunctionDeclarationStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { AmbientableNode, AsyncableNode, BodyableNode, ChildOrderableNode, ExportableNode, GeneratorableNode, ModifierableNode, NameableNode,
    TextInsertableNode, UnwrappableNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { NamespaceChildableNode } from "../namespace";
import { StatementedNode } from "../statement";
import { FunctionLikeDeclaration } from "./FunctionLikeDeclaration";
import { insertOverloads, OverloadableNode } from "./OverloadableNode";

export const FunctionDeclarationBase = ChildOrderableNode(UnwrappableNode(TextInsertableNode(OverloadableNode(BodyableNode(AsyncableNode(GeneratorableNode(
    FunctionLikeDeclaration(StatementedNode(AmbientableNode(NamespaceChildableNode(ExportableNode(ModifierableNode(NameableNode(Node)))))))
)))))));
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<FunctionDeclarationStructure>) {
        callBaseFill(FunctionDeclarationBase.prototype, this, structure);

        if (structure.overloads != null && structure.overloads.length > 0)
            this.addOverloads(structure.overloads);

        return this;
    }

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
    addOverloads(structures: FunctionDeclarationOverloadStructure[]) {
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
    insertOverloads(index: number, structures: FunctionDeclarationOverloadStructure[]) {
        const thisName = this.getName();
        const childCodes = structures.map(structure => `function ${thisName}();`);

        return insertOverloads<FunctionDeclaration, FunctionDeclarationOverloadStructure>({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromFunctionDeclarationOverload,
            fillNodeFromStructure: (node, structure) => node.fill(structure),
            expectedSyntaxKind: SyntaxKind.FunctionDeclaration
        });
    }

    /**
     * Removes this function declaration.
     */
    remove() {
        removeOverloadableStatementedNodeChild(this);
    }
}
