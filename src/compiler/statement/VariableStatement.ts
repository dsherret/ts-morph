import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {VariableStatementStructure} from "./../../structures";
import {ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode} from "./../base";
import {NamespaceChildableNode} from "./../namespace";
import {callBaseFill} from "./../callBaseFill";
import {VariableDeclarationList} from "./VariableDeclarationList";

export const VariableStatementBase = NamespaceChildableNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(Node)))));
export class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<VariableStatementStructure>) {
        callBaseFill(VariableStatementBase.prototype, this, structure);

        if (structure.declarationType != null)
            this.getDeclarationList().setDeclarationType(structure.declarationType);
        if (structure.declarations != null)
            throw new errors.NotImplementedError("Filling variable declarations not implemented. Please open an issue if you need this and I will increase the prioirty.");

        return this;
    }

    /**
     * Gets the declaration list of variables.
     */
    getDeclarationList(): VariableDeclarationList {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.declarationList, this.sourceFile) as VariableDeclarationList;
    }

    /**
     * Removes this variable statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
