import * as ts from "typescript";
import {Node} from "./Node";
import {Identifier} from "./Identifier";

export type EntityName = Identifier | QualifiedName;

export class QualifiedName extends Node<ts.QualifiedName> {
    /**
     * Gets the left side of the qualified name.
     */
    getLeft() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.left, this.sourceFile) as EntityName;
    }

    /**
     * Gets the right identifier of the qualified name.
     */
    getRight() {
        return this.global.compilerFactory.getNodeFromCompilerNode(this.compilerNode.right, this.sourceFile) as Identifier;
    }
}
