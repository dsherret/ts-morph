import * as ts from "typescript";
import {Node} from "./Node";
import {Type} from "./../type";
import {ReferencedSymbol} from "./../tools";

export class Identifier extends Node<ts.Identifier> {
    /**
     * Gets the text for the identifier.
     */
    getText() {
        return this.compilerNode.text;
    }

    /**
     * Renames the identifier.
     * @param newName - New name of the identifier.
     */
    rename(newName: string) {
        this.global.languageService.renameNode(this, newName);
    }

    /**
     * Finds all the references of this identifier.
     */
    findReferences(): ReferencedSymbol[] {
        return this.global.languageService.findReferences(this.sourceFile, this);
    }

    /**
     * Gets the type of the identifier.
     */
    getType(): Type {
        return this.global.typeChecker.getTypeAtLocation(this);
    }
}
