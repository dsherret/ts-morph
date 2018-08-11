import { VariableDeclarationStructure, VariableStatementStructure } from "../../structures";
import { ts } from "../../typescript";
import { AmbientableNode, ChildOrderableNode, ExportableNode, JSDocableNode, ModifierableNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { NamespaceChildableNode } from "../namespace";
import { Statement } from "./Statement";
import { VariableDeclaration, VariableDeclarationKind, VariableDeclarationList } from "../variable";

export const VariableStatementBase = ChildOrderableNode(NamespaceChildableNode(JSDocableNode(AmbientableNode(ExportableNode(ModifierableNode(Statement))))));
export class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
    /**
     * Get variable declaration list.
     */
    getDeclarationList(): VariableDeclarationList {
        return this.getNodeFromCompilerNode(this.compilerNode.declarationList);
    }

    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[] {
        return this.getDeclarationList().getDeclarations();
    }

    /**
     * Gets the variable declaration kind.
     */
    getDeclarationKind(): VariableDeclarationKind {
        return this.getDeclarationList().getDeclarationKind();
    }

    /**
     * Gets the variable declaration kind keyword.
     */
    getDeclarationKindKeyword() {
        return this.getDeclarationList().getDeclarationKindKeyword();
    }

    /**
     * Sets the variable declaration kind.
     * @param type - Type to set.
     */
    setDeclarationKind(type: VariableDeclarationKind) {
        return this.getDeclarationList().setDeclarationKind(type);
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
     * @param index - Child index to insert at.
     * @param structure - Structure representing the variable declaration to insert.
     */
    insertDeclaration(index: number, structure: VariableDeclarationStructure) {
        return this.getDeclarationList().insertDeclaration(index, structure);
    }

    /**
     * Inserts variable declarations at the specified index within the statement.
     * @param index - Child index to insert at.
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

        if (structure.declarationKind != null)
            this.setDeclarationKind(structure.declarationKind);
        if (structure.declarations != null)
            this.addDeclarations(structure.declarations);

        return this;
    }
}
