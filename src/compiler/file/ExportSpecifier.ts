import * as ts from "typescript";
import {insertIntoParent, replaceNodeText, removeCommaSeparatedChild} from "./../../manipulation";
import {TypeGuards} from "./../../utils";
import {Node, Identifier} from "./../common";
import {ExportDeclaration} from "./ExportDeclaration";

export class ExportSpecifier extends Node<ts.ExportSpecifier> {
    /**
     * Sets the name of what's being exported.
     */
    setName(name: string) {
        const nameNode = this.getNameNode();
        if (nameNode.getText() === name)
            return this;

        const start = nameNode.getStart();
        replaceNodeText(this.sourceFile, start, start + nameNode.getWidth(), name);

        return this;
    }

    /**
     * Renames the name of what's being exported.
     */
    renameName(name: string) {
        this.getNameNode().rename(name);
        return this;
    }

    /**
     * Gets the name node of what's being exported.
     */
    getNameNode() {
        return this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier) as Identifier;
    }

    /**
     * Sets the alias for the name being exported.
     * @param alias - Alias to set.
     */
    setAlias(alias: string) {
        let aliasIdentifier = this.getAliasIdentifier();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            const nameNode = this.getNameNode();
            insertIntoParent({
                insertPos: nameNode.getEnd(),
                childIndex: nameNode.getChildIndex() + 1,
                insertItemsCount: 2, // AsKeyword, Identifier
                parent: this,
                newText: ` as ${nameNode.getText()}`
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
     * Gets the export declaration associated with this export specifier.
     */
    getExportDeclaration() {
        return this.getFirstAncestorByKindOrThrow(ts.SyntaxKind.ExportDeclaration) as ExportDeclaration;
    }

    /**
     * Removes the export specifier.
     */
    remove() {
        const exportDeclaration = this.getExportDeclaration();
        const exports = exportDeclaration.getNamedExports();

        if (exports.length > 1)
            removeCommaSeparatedChild(this);
        else if (exportDeclaration.hasModuleSpecifier())
            exportDeclaration.toNamespaceExport();
        else
            exportDeclaration.remove();
    }
}
