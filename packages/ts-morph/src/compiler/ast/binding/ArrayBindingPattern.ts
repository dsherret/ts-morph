import { ts } from "@ts-morph/common";
import { Node } from "../common";

export class ArrayBindingPattern extends Node<ts.ArrayBindingPattern> {
    /**
     * Gets the array binding pattern's elements.
     */
    getElements() {
        return this.compilerNode.elements.map(e => this._getNodeFromCompilerNode(e));
    }
}
