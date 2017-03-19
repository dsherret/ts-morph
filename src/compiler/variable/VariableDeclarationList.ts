import * as ts from "typescript";
import {Node} from "./../common";
import {VariableDeclaration} from "./VariableDeclaration";
import {VariableDeclarationType} from "./VariableDeclarationType";

export class VariableDeclarationList extends Node<ts.VariableDeclarationList> {
    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[] {
        return this.node.declarations.map(d => this.factory.getVariableDeclaration(d));
    }

    /**
     * Gets the variable declaration type.
     */
    getDeclarationType(): VariableDeclarationType {
        const nodeFlags = this.node.flags;

        if (nodeFlags & ts.NodeFlags.Let)
            return VariableDeclarationType.Let;
        else if (nodeFlags & ts.NodeFlags.Const)
            return VariableDeclarationType.Const;
        else
            return VariableDeclarationType.Var;
    }
}
