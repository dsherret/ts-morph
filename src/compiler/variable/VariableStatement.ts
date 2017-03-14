import * as ts from "typescript";
import {Node} from "./../common";
import {VariableDeclarationList} from "./VariableDeclarationList";

export class VariableStatement extends Node<ts.VariableStatement> {
    getDeclarationList() {
        return this.factory.getVariableDeclarationList(this.node.declarationList);
    }
}
