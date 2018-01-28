import * as ts from "typescript";
import {insertIntoParent, insertIntoCommaSeparatedNodes} from "./../../manipulation";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {VariableStatementStructure, VariableDeclarationStructure} from "./../../structures";
import {ExportableNode, ModifierableNode, AmbientableNode, JSDocableNode, ChildOrderableNode} from "./../base";
import {NamespaceChildableNode} from "./../namespace";
import {callBaseFill} from "./../callBaseFill";
import {VariableDeclaration} from "./VariableDeclaration";
import {VariableDeclarationType} from "./VariableDeclarationType";
import {Statement} from "./Statement";
import {VariableDeclarationList} from "./VariableDeclarationList";

export const VariableStatementBase = ChildOrderableNode(NamespaceChildableNode(JSDocableNode(AmbientableNode(ExportableNode(ModifierableNode(Statement))))));
export class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
    /**
     * Get variable declaration list.
     */
    getDeclarationList(): VariableDeclarationList {
        return this.getNodeFromCompilerNode<VariableDeclarationList>(this.compilerNode.declarationList);
    }

    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[] {
        return this.getDeclarationList().getDeclarations();
    }

    /**
     * Gets the variable declaration type.
     */
    getDeclarationType(): VariableDeclarationType {
        return this.getDeclarationList().getDeclarationType();
    }

    /**
     * Gets the variable declaration type keyword.
     */
    getDeclarationTypeKeyword(): Node {
        return this.getDeclarationList().getDeclarationTypeKeyword();
    }

    /**
     * Sets the variable declaration type.
     * @param type - Type to set.
     */
    setDeclarationType(type: VariableDeclarationType) {
        return this.getDeclarationList().setDeclarationType(type);
    }

    /**
     * Add a variable declaration to the statement.
     * @param structure - Structure representing the variable declaration to add.
     */
    addDeclaration(structure: VariableDeclarationStructure) {
        return this.getDeclarationList().addDeclaration(structure);
    }

    /**
     * Adds variable declarations to the statement.
     * @param structures - Structures representing the variable declarations to add.
     */
    addDeclarations(structures: VariableDeclarationStructure[]) {
        return this.getDeclarationList().addDeclarations(structures);
    }

    /**
     * Inserts a variable declaration at the specified index within the statement.
     * @param index - Index to insert.
     * @param structure - Structure representing the variable declaration to insert.
     */
    insertDeclaration(index: number, structure: VariableDeclarationStructure) {
        return this.getDeclarationList().insertDeclaration(index, structure);
    }

    /**
     * Inserts variable declarations at the specified index within the statement.
     * @param index - Index to insert.
     * @param structures - Structures representing the variable declarations to insert.
     */
    insertDeclarations(index: number, structures: VariableDeclarationStructure[]) {
        return this.getDeclarationList().insertDeclarations(index, structures);
    }

    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableStatementStructure>) {
        callBaseFill(VariableStatementBase.prototype, this, structure);

        if (structure.declarationType != null)
            this.setDeclarationType(structure.declarationType);
        if (structure.declarations != null)
            this.addDeclarations(structure.declarations);

        return this;
    }
}
