import { ts } from "@ts-morph/common";
import { VariableDeclarationStructure, VariableStatementStructure, VariableStatementSpecificStructure, StructureKind,
    OptionalKind } from "../../../structures";
import { AmbientableNode, ExportableNode, JSDocableNode, ModifierableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { NamespaceChildableNode } from "../module";
import { Statement } from "./Statement";
import { VariableDeclaration, VariableDeclarationKind, VariableDeclarationList } from "../variable";
import { callBaseGetStructure } from "../callBaseGetStructure";

const createBase = <T extends typeof Statement>(ctor: T) => NamespaceChildableNode(JSDocableNode(AmbientableNode(
    ExportableNode(ModifierableNode(ctor))
)));
export const VariableStatementBase = createBase(Statement);
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
    addDeclaration(structure: OptionalKind<VariableDeclarationStructure>) {
        return this.getDeclarationList().addDeclaration(structure);
    }

    /**
     * Adds variable declarations to the statement.
     * @param structures - Structures representing the variable declarations to add.
     */
    addDeclarations(structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>) {
        return this.getDeclarationList().addDeclarations(structures);
    }

    /**
     * Inserts a variable declaration at the specified index within the statement.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the variable declaration to insert.
     */
    insertDeclaration(index: number, structure: OptionalKind<VariableDeclarationStructure>) {
        return this.getDeclarationList().insertDeclaration(index, structure);
    }

    /**
     * Inserts variable declarations at the specified index within the statement.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the variable declarations to insert.
     */
    insertDeclarations(index: number, structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>) {
        return this.getDeclarationList().insertDeclarations(index, structures);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<VariableStatementStructure>) {
        callBaseSet(VariableStatementBase.prototype, this, structure);

        if (structure.declarationKind != null)
            this.setDeclarationKind(structure.declarationKind);
        if (structure.declarations != null) {
            const existingDeclarations = this.getDeclarations();
            this.addDeclarations(structure.declarations);
            existingDeclarations.forEach(d => d.remove());
        }

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
