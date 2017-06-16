import * as ts from "typescript";
import {Node, Identifier} from "./../common";

export class ImportSpecifier extends Node<ts.ImportSpecifier> {
    /**
     * Gets the identifier of what's being imported.
     */
    getIdentifier() {
        return this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier) as Identifier;
    }

    /**
     * Gets the alias identifier, if it exists.
     */
    getAliasIdentifier() {
        const asKeyword = this.getFirstChildByKind(ts.SyntaxKind.AsKeyword);
        if (asKeyword == null)
            return undefined;
        const aliasIdentifier = asKeyword.getNextSibling();
        if (aliasIdentifier == null || !(aliasIdentifier instanceof Identifier))
            return undefined;
        return aliasIdentifier;
    }
}
