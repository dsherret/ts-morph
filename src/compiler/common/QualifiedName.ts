import {ts} from "./../../typescript";
import {Node} from "./Node";
import {Identifier} from "./Identifier";
import {EntityName} from "./../aliases";

export class QualifiedName extends Node<ts.QualifiedName> {
    /**
     * Gets the left side of the qualified name.
     */
    getLeft() {
        return this.getNodeFromCompilerNode<EntityName>(this.compilerNode.left);
    }

    /**
     * Gets the right identifier of the qualified name.
     */
    getRight() {
        return this.getNodeFromCompilerNode<Identifier>(this.compilerNode.right);
    }
}
