import { VariableDeclarationStructure, VariableStatementStructure, VariableStatementSpecificStructure, StructureKind } from "../../../structures";
import { ts } from "../../../typescript";
import { AmbientableNode, ExportableNode, JSDocableNode, ModifierableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { NamespaceChildableNode } from "../module";
import { Statement } from "./Statement";
import { VariableDeclaration, VariableDeclarationKind, VariableDeclarationList } from "../variable";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const VariableStatementBase = NamespaceChildableNode(JSDocableNode(AmbientableNode(ExportableNode(ModifierableNode(Statement)))));
export class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
    /**
     * Get variable declaration list.
     */
    getDeclarationList(): VariableDeclarationList {
        return this._getNodeFromCompilerNode(this.compilerNode.declarationList);
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
    addDeclarations(structures: ReadonlyArray<VariableDeclarationStructure>) {
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
    insertDeclarations(index: number, structures: ReadonlyArray<VariableDeclarationStructure>) {
        return this.getDeclarationList().insertDeclarations(index, structures);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<VariableStatementStructure>) {
        callBaseSet(VariableStatementBase.prototype, this, structure);

        this.getDeclarationList().set({
            declarationKind: structure.declarationKind,
            declarations: structure.declarations
        });

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): VariableStatementStructure {
        return callBaseGetStructure<VariableStatementSpecificStructure>(VariableStatementBase.prototype, this, {
            kind: StructureKind.VariableStatement,
            declarationKind: this.getDeclarationKind(),
            declarations: this.getDeclarations().map(declaration => declaration.getStructure())
        }) as any as VariableStatementStructure;
    }
}
