import * as ts from "typescript";
import {Node} from "./Node";

export class Identifier extends Node<ts.Identifier> {
    /**
     * Gets the text for the identifier.
     */
    getText() {
        return this.compilerNode.text;
    }

    /**
     * Renames an identifier.
     * @param newName - New name of the identifier.
     */
    rename(newName: string) {
        this.factory.getLanguageService().renameNode(this, newName);
    }
}
