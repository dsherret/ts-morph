import { ts } from "@ts-morph/common";
import { EntityName } from "../aliases";
import { Node } from "../common";
import { Identifier } from "./Identifier";

export class QualifiedName extends Node<ts.QualifiedName> {
    /**
     * Gets the left side of the qualified name.
     */
    getLeft(): EntityName {
        return this._getNodeFromCompilerNode(this.compilerNode.left);
    }

    /**
     * Gets the right identifier of the qualified name.
     */
    getRight(): Identifier {
        return this._getNodeFromCompilerNode(this.compilerNode.right);
    }
}
