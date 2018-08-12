import { ts } from "../../typescript";
import { Node } from "../common";

export class ObjectBindingPattern extends Node<ts.ObjectBindingPattern> {
    /**
     * Gets the object binding pattern's elements.
     */
    getElements() {
        return this.compilerNode.elements.map(e => this.getNodeFromCompilerNode(e));
    }
}
