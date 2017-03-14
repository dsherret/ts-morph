import * as ts from "typescript";
import {Node} from "./../common";
import {VariableDeclaration} from "./VariableDeclaration";

export class VariableDeclarationList extends Node<ts.VariableDeclarationList> {
    getDeclarations() {
        return this.node.declarations.map(d => this.factory.getVariableDeclaration(d));
    }
}
