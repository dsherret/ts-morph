import * as ts from "typescript";
import {removeStatementedNodeChild} from "./../../manipulation";
import {Node} from "./../common";
import {ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode} from "./../base";
import {NamespaceChildableNode} from "./../namespace";
import {VariableDeclarationList} from "./VariableDeclarationList";

export const VariableStatementBase = NamespaceChildableNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(Node)))));
export class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
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
