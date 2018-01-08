import * as ts from "typescript";
import {Node} from "./Node";
import {Identifier} from "./Identifier";

export type EntityName = Identifier | QualifiedName;

export class QualifiedName extends Node<ts.QualifiedName> {
    /**
     * Gets the left side of the qualified name.
     */
    getLeft() {
        return this.getNodeFromCompilerNode(this.compilerNode.left) as EntityName;
    }

    /**
     * Gets the right identifier of the qualified name.
     */
    getRight() {
        return this.getNodeFromCompilerNode(this.compilerNode.right) as Identifier;
    }
}
