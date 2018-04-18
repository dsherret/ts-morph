import { ts } from "../../typescript";
import { Type } from "../type";
import { ReferenceFindableNode } from "../base";
import { ReferencedSymbol, DefinitionInfo, ImplementationLocation } from "../tools";
import { PrimaryExpression } from "../expression/PrimaryExpression";
import { Node } from "./Node";

export class Identifier extends ReferenceFindableNode(PrimaryExpression)<ts.Identifier> {
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
     * Find the nodes that reference the definition(s) of the identifier.
     * @deprecated Use getReferencingNodes().
     */
    getDefinitionReferencingNodes(): Node[] {
        return this.getReferencingNodes();
    }

    /**
     * Gets the definition nodes of the identifier.
     * @remarks This is similar to "go to definition" and `.getDefinitions()`, but only returns the nodes.
     */
    getDefinitionNodes(): Node[] {
        return this.getDefinitions().map(d => d.getNode()).filter(d => d != null) as Node[];
    }

    /**
     * Gets the definitions of the identifier.
     * @remarks This is similar to "go to definition." Use `.getDefinitionNodes()` if you only care about the nodes.
     */
    getDefinitions(): DefinitionInfo[] {
        return this.global.languageService.getDefinitions(this);
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
