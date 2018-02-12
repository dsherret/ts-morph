import {ts} from "./../../typescript";
import {Type} from "./../type";
import {ReferencedSymbol, DefinitionInfo, ImplementationLocation} from "./../tools";
import {PrimaryExpression} from "./../expression/PrimaryExpression";

export class Identifier extends PrimaryExpression<ts.Identifier> {
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
        return this.global.languageService.findReferences(this);
    }

    /**
     * Gets the definitions of the current identifier.
     *
     * This is similar to "go to definition."
     */
    getDefinitions(): DefinitionInfo[] {
        return this.global.languageService.getDefinitions(this);
    }

    /**
     * Gets the implementations of the current identifier.
     *
     * This is similar to "go to implementation."
     */
    getImplementations(): ImplementationLocation[] {
        return this.global.languageService.getImplementations(this);
    }
}
