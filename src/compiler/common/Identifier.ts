import { ts } from "../../typescript";
import { ReferenceFindableNode } from "../base";
import { PrimaryExpression } from "../expression/PrimaryExpression";
import { DefinitionInfo, ImplementationLocation } from "../tools";
import { Node } from "./Node";

export const IdentifierBase = ReferenceFindableNode(PrimaryExpression);
export class Identifier extends IdentifierBase<ts.Identifier> {
    /**
     * Gets the text for the identifier.
     */
    getText(): string {
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
     * Gets the definition nodes of the identifier.
     * @remarks This is similar to "go to definition" and `.getDefinitions()`, but only returns the nodes.
     */
    getDefinitionNodes(): Node[] {
        return this.getDefinitions().map(d => d.getDeclarationNode()).filter(d => d != null) as Node[];
    }

    /**
     * Gets the definitions of the identifier.
     * @remarks This is similar to "go to definition." Use `.getDefinitionNodes()` if you only care about the nodes.
     */
    getDefinitions(): DefinitionInfo[] {
        return this.global.languageService.getDefinitions(this);
    }

    /**
     * Gets the name of what this identifier is referencing.
     */
    getName(): string {
        return this.compilerNode.text;
    }
    /**
     * Gets the implementations of the identifier.
     *
     * This is similar to "go to implementation."
     */
    getImplementations(): ImplementationLocation[] {
        return this.global.languageService.getImplementations(this);
    }
}
