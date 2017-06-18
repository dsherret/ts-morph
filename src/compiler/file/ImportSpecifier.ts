import * as ts from "typescript";
import {Node, Identifier} from "./../common";
import {insertStraight, replaceStraight, removeNodes} from "./../../manipulation";

export class ImportSpecifier extends Node<ts.ImportSpecifier> {
    /**
     * Sets the identifier being imported.
     * @param name - Name being imported.
     */
    setName(name: string) {
        const nameIdentifier = this.getName();
        if (nameIdentifier.getText() === name)
            return this;

        this.factory.getLanguageService().renameReplaces([{
            sourceFile: this.sourceFile,
            textSpans: [{ start: nameIdentifier.getStart(), length: nameIdentifier.getWidth() }]
        }], name);

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
        let aliasIdentifier = this.getAlias();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            const nameIdentifier = this.getName();
            insertStraight({ insertPos: nameIdentifier.getEnd(), parent: this, newCode: ` as ${nameIdentifier.getText()}` });
            aliasIdentifier = this.getAlias()!;
        }
        aliasIdentifier.rename(alias);
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
