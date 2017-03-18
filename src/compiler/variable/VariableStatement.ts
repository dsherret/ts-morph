import * as ts from "typescript";
import {Node} from "./../common";
import {ExportedNode} from "./../base";
import {VariableDeclarationList} from "./VariableDeclarationList";

export const VariableStatementBase = ExportedNode(Node);
export class VariableStatement extends VariableStatementBase<ts.VariableStatement> {
    /**
     * Gets the declaration list of variables.
     */
    getDeclarationList(): VariableDeclarationList {
        return this.factory.getVariableDeclarationList(this.node.declarationList);
    }
}
