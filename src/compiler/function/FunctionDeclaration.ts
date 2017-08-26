import * as ts from "typescript";
import {Node} from "./../common";
import {FunctionDeclarationOverloadStructure, FunctionDeclarationStructure} from "./../../structures";
import {verifyAndGetIndex} from "./../../manipulation";
import * as getStructureFuncs from "./../../manipulation/getStructureFunctions";
import {NamedNode, ModifierableNode, ExportableNode, AmbientableNode, AsyncableNode, GeneratorableNode, BodyableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {NamespaceChildableNode} from "./../namespace";
import {callBaseFill} from "./../callBaseFill";
import {FunctionLikeDeclaration} from "./FunctionLikeDeclaration";
import {OverloadableNode, insertOverloads} from "./OverloadableNode";

export const FunctionDeclarationBase = OverloadableNode(BodyableNode(AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(StatementedNode(AmbientableNode(
    NamespaceChildableNode(ExportableNode(ModifierableNode(NamedNode(Node)))))
))))));
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
     * @param index - Index to insert.
     * @param structure - Structure of the overload.
     */
    insertOverload(index: number, structure: FunctionDeclarationOverloadStructure) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts function overloads.
     * @param index - Index to insert.
     * @param structure - Structures of the overloads.
     */
    insertOverloads(index: number, structures: FunctionDeclarationOverloadStructure[]) {
        const indentationText = this.getIndentationText();
        const thisName = this.getName();
        const childCodes = structures.map(structure => `${indentationText}function ${thisName}();`);

        return insertOverloads({
            node: this,
            index,
            structures,
            childCodes,
            getThisStructure: getStructureFuncs.fromFunctionDeclarationOverload,
            fillNodeFromStructure: (node, structure) => node.fill(structure),
            expectedSyntaxKind: ts.SyntaxKind.FunctionDeclaration
        });
    }
}
