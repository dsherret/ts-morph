import * as ts from "typescript";
import {removeFromBracesOrSourceFile} from "./../../manipulation";
import * as getStructureFuncs from "./../../manipulation/getStructureFunctions";
import * as fillClassFuncs from "./../../manipulation/fillClassFunctions";
import {ConstructorDeclarationOverloadStructure} from "./../../structures";
import {Node} from "./../common";
import {ScopedNode, BodyableNode} from "./../base";
import {FunctionLikeDeclaration, OverloadableNode, insertOverloads} from "./../function";

export const ConstructorDeclarationBase = OverloadableNode(ScopedNode(FunctionLikeDeclaration(BodyableNode(Node))));
export class ConstructorDeclaration extends ConstructorDeclarationBase<ts.ConstructorDeclaration> {
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
     * @param index - Index to insert at.
     * @param structure - Structures to insert.
     */
    insertOverload(index: number, structure: ConstructorDeclarationOverloadStructure) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts constructor overloads.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertOverloads(index: number, structures: ConstructorDeclarationOverloadStructure[]) {
        const indentationText = this.getIndentationText();
        const childCodes = structures.map(structure => `${indentationText}constructor();`);

        return insertOverloads({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromConstructorDeclarationOverload,
            fillNodeFromStructure: fillClassFuncs.fillConstructorDeclarationOverloadFromStructure,
            expectedSyntaxKind: ts.SyntaxKind.Constructor
        });
    }

    /**
     * Remove the constructor.
     */
    remove() {
        const nodesToRemove: Node[] = [this];
        if (this.isImplementation())
            nodesToRemove.push(...this.getOverloads());

        for (const nodeToRemove of nodesToRemove) {
            removeFromBracesOrSourceFile({
                node: nodeToRemove
            });
        }
    }
}
