import * as ts from "typescript";
import {Node, Identifier} from "./../common";
import {insertStraight, replaceStraight, removeNodes} from "./../../manipulation";

export class ImportSpecifier extends Node<ts.ImportSpecifier> {
    /**
     * Sets the identifier being imported. Only renames in the current file.
     * @param name - Name being imported.
     */
    setName(name: string) {
        const languageService = this.factory.getLanguageService();
        const renameReplaces = languageService.findRenameReplaces(this.getName()).filter(r => r.sourceFile === this.sourceFile);
        languageService.renameReplaces(renameReplaces, name);
        return this;
    }

    /**
     * Gets the name of what's being imported.
     */
    getName() {
        return this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier) as Identifier;
    }

    /**
     * Sets the alias for the name being imported.
     * @param alias - Alias to set.
     */
    setAlias(alias: string) {
        const aliasIdentifier = this.getAlias();
        if (aliasIdentifier != null)
            aliasIdentifier.rename(alias);
        else {
            const languageService = this.factory.getLanguageService();
            const nameNode = this.getName();
            const replaces = languageService.findRenameReplaces(nameNode).filter(r => r.sourceFile === this.sourceFile);
            replaces.forEach(r => {
                // exclude renaming the name
                r.textSpans = r.textSpans.filter(s => !nameNode.containsRange(s.start, s.start + s.length));
            });
            languageService.renameReplaces(replaces, alias);
            insertStraight({ insertPos: this.getName().getEnd(), parent: this, newCode: ` as ${alias}` });
        }
        return this;
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
