import * as ts from "typescript";
import {Node, Identifier} from "./../common";
import {insertStraight, replaceStraight, removeNodes} from "./../../manipulation";

export class ExportSpecifier extends Node<ts.ExportSpecifier> {
    /**
     * Gets the name of what's being exported.
     */
    getName() {
        return this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier) as Identifier;
    }

    /**
     * Gets the alias, if it exists.
     */
    getAlias() {
        const asKeyword = this.getFirstChildByKind(ts.SyntaxKind.AsKeyword);
        if (asKeyword == null)
            return undefined;
        const aliasIdentifier = asKeyword.getNextSibling();
        if (aliasIdentifier == null || !(aliasIdentifier instanceof Identifier))
            return undefined;
        return aliasIdentifier;
    }
}
