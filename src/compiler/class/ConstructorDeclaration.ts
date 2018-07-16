import { removeOverloadableClassMember } from "../../manipulation";
import * as getStructureFuncs from "../../manipulation/helpers/getStructureFunctions";
import { ConstructorDeclarationOverloadStructure, ConstructorDeclarationStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { BodyableNode, ChildOrderableNode, ScopedNode, TextInsertableNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { FunctionLikeDeclaration, insertOverloads, OverloadableNode } from "../function";

export const ConstructorDeclarationBase = ChildOrderableNode(TextInsertableNode(OverloadableNode(ScopedNode(FunctionLikeDeclaration(BodyableNode(Node))))));
export class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ConstructorDeclarationStructure>) {
        callBaseFill(ConstructorDeclarationBase.prototype, this, structure);

        if (structure.overloads != null && structure.overloads.length > 0)
            this.addOverloads(structure.overloads);

        return this;
    }

    /**
     * Add a constructor overload.
     * @param structure - Structure to add.
     */
    addOverload(structure: ConstructorDeclarationOverloadStructure) {
        return this.addOverloads([structure])[0];
    }

    /**
     * Add constructor overloads.
     * @param structures - Structures to add.
     */
    addOverloads(structures: ConstructorDeclarationOverloadStructure[]) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }

    /**
     * Inserts a constructor overload.
     * @param index - Child index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index: number, structure: ConstructorDeclarationOverloadStructure) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts constructor overloads.
     * @param index - Child index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index: number, structures: ConstructorDeclarationOverloadStructure[]) {
        const childCodes = structures.map(structure => `constructor();`);

        return insertOverloads<ConstructorDeclaration, ConstructorDeclarationOverloadStructure>({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromConstructorDeclarationOverload,
            fillNodeFromStructure: (node, structure) => node.fill(structure),
            expectedSyntaxKind: SyntaxKind.Constructor
        });
    }

    /**
     * Remove the constructor.
     */
    remove() {
        removeOverloadableClassMember(this);
    }
}
