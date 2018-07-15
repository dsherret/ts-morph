import { removeOverloadableClassMember } from "../../manipulation";
import * as getStructureFuncs from "../../manipulation/helpers/getStructureFunctions";
import { MethodDeclarationOverloadStructure, MethodDeclarationStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { AsyncableNode, BodyableNode, ChildOrderableNode, DecoratableNode, GeneratorableNode, PropertyNamedNode, ScopedNode, StaticableNode, TextInsertableNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { FunctionLikeDeclaration, insertOverloads, OverloadableNode } from "../function";
import { AbstractableNode } from "./base";

export const MethodDeclarationBase = ChildOrderableNode(TextInsertableNode(OverloadableNode(BodyableNode(DecoratableNode(AbstractableNode(ScopedNode(
    StaticableNode(AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(PropertyNamedNode(Node)))))
)))))));
export class MethodDeclaration extends MethodDeclarationBase<ts.MethodDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<MethodDeclarationStructure>) {
        callBaseFill(MethodDeclarationBase.prototype, this, structure);

        if (structure.overloads != null && structure.overloads.length > 0)
            this.addOverloads(structure.overloads);

        return this;
    }

    /**
     * Add a method overload.
     * @param structure - Structure to add.
     */
    addOverload(structure: MethodDeclarationOverloadStructure) {
        return this.addOverloads([structure])[0];
    }

    /**
     * Add method overloads.
     * @param structures - Structures to add.
     */
    addOverloads(structures: MethodDeclarationOverloadStructure[]) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }

    /**
     * Inserts a method overload.
     * @param index - Child index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index: number, structure: MethodDeclarationOverloadStructure) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts method overloads.
     * @param index - Child index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index: number, structures: MethodDeclarationOverloadStructure[]) {
        const thisName = this.getName();
        const childCodes = structures.map(structure => `${thisName}();`);

        return insertOverloads<MethodDeclaration, MethodDeclarationOverloadStructure>({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromMethodDeclarationOverload,
            fillNodeFromStructure: (node, structure) => node.fill(structure),
            expectedSyntaxKind: SyntaxKind.MethodDeclaration
        });
    }

    /**
     * Removes the method.
     */
    remove() {
        removeOverloadableClassMember(this);
    }
}
