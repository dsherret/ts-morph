import { ts } from "../../typescript";
import { Node } from "./Node";
import { Identifier } from "./Identifier";
import { EntityName } from "../aliases";

export class QualifiedName extends Node<ts.QualifiedName> {
    /**
     * Gets the left side of the qualified name.
     */
    getLeft(): EntityName {
        return this.getNodeFromCompilerNode(this.compilerNode.left);
    }

    /**
     * Gets the right identifier of the qualified name.
     */
    getRight(): Identifier {
        return this.getNodeFromCompilerNode(this.compilerNode.right);
    }
}
