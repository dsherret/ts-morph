import * as ts from "typescript";
import {insertIntoParent, replaceNodeText, removeCommaSeparatedChild} from "./../../manipulation";
import {TypeGuards} from "./../../utils";
import {Node, Identifier} from "./../common";
import {ImportDeclaration} from "./ImportDeclaration";

export class ImportSpecifier extends Node<ts.ImportSpecifier> {
    /**
     * Sets the identifier being imported.
     * @param name - Name being imported.
     */
    setName(name: string) {
        const nameIdentifier = this.getNameIdentifier();
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
        this.getNameIdentifier().rename(name);
        return this;
    }

    /**
     * Gets the name identifier of what's being imported.
     */
    getNameIdentifier() {
        return this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier) as Identifier;
    }

    /**
     * Sets the alias for the name being imported.
     * @param alias - Alias to set.
     */
    setAlias(alias: string) {
        let aliasIdentifier = this.getAliasIdentifier();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            const nameIdentifier = this.getNameIdentifier();
            insertIntoParent({
                insertPos: nameIdentifier.getEnd(),
                childIndex: nameIdentifier.getChildIndex() + 1,
                insertItemsCount: 2, // AsKeyword, Identifier
                parent: this,
                newText: ` as ${nameIdentifier.getText()}`
            });
            aliasIdentifier = this.getAliasIdentifier()!;
        }
        aliasIdentifier.rename(alias);
        return this;
    }

    /**
     * Gets the alias identifier, if it exists.
     */
    getAliasIdentifier() {
        const asKeyword = this.getFirstChildByKind(ts.SyntaxKind.AsKeyword);
        if (asKeyword == null)
            return undefined;
        const aliasIdentifier = asKeyword.getNextSibling();
        if (aliasIdentifier == null || !(TypeGuards.isIdentifier(aliasIdentifier)))
            return undefined;
        return aliasIdentifier;
    }

    /**
     * Gets the import declaration associated with this import specifier.
     */
    getImportDeclaration() {
        return this.getFirstAncestorByKindOrThrow(ts.SyntaxKind.ImportDeclaration) as ImportDeclaration;
    }

    /**
     * Remove the import specifier.
     */
    remove() {
        const importDeclaration = this.getImportDeclaration();
        const namedImports = importDeclaration.getNamedImports();

        if (namedImports.length > 1)
            removeCommaSeparatedChild(this);
        else
            importDeclaration.removeNamedImports();
    }
}
