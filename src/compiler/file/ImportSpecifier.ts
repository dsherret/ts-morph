import * as ts from "typescript";
import {insertIntoParent, replaceNodeText} from "./../../manipulation";
import {Node, Identifier} from "./../common";
import {ImportDeclaration} from "./ImportDeclaration";

export class ImportSpecifier extends Node<ts.ImportSpecifier> {
    /**
     * Sets the identifier being imported.
     * @param name - Name being imported.
     */
    setName(name: string) {
        const nameIdentifier = this.getName();
        if (nameIdentifier.getText() === name)
            return this;

        const start = nameIdentifier.getStart();
        replaceNodeText(this.sourceFile, start, start + nameIdentifier.getWidth(), name);

        return this;
    }

    /**
     * Renames the identifier being imported.
     * @param name - New name.
     */
    renameName(name: string) {
        this.getName().rename(name);
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
            insertIntoParent({
                insertPos: nameIdentifier.getEnd(),
                childIndex: nameIdentifier.getChildIndex() + 1,
                insertItemsCount: 2, // AsKeyword, Identifier
                parent: this,
                newText: ` as ${nameIdentifier.getText()}`
            });
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

    /**
     * Gets the import declaration associated with this import specifier.
     */
    getImportDeclaration() {
        return this.getFirstParentByKindOrThrow(ts.SyntaxKind.ImportDeclaration) as ImportDeclaration;
    }
}
