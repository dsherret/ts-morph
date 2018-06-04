import { ts } from "../../typescript";
import { EntityName } from "../aliases";
import { Identifier } from "./Identifier";
import { Node } from "./Node";

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
