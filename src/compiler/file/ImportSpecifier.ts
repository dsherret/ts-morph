import { insertIntoParentTextRange, removeCommaSeparatedChild, replaceNodeText, removeChildren } from "../../manipulation";
import { SyntaxKind, ts } from "../../typescript";
import { StringUtils } from "../../utils";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ImportSpecifierStructure } from "../../structures";

// todo: There's a lot of common code that could be shared with ExportSpecifier. It could be moved to a mixin.

export class ImportSpecifier extends Node<ts.ImportSpecifier> {
    /**
     * Sets the identifier being imported.
     * @param name - Name being imported.
     */
    setName(name: string) {
        const nameNode = this.getNameNode();
        if (nameNode.getText() === name)
            return this;

        const start = nameNode.getStart();
        replaceNodeText({
            sourceFile: this.sourceFile,
            start,
            replacingLength: nameNode.getWidth(),
            newText: name
        });

        return this;
    }

    /**
     * Gets the name of the import specifier.
     */
    getName() {
        return this.getNameNode().getText();
    }

    /**
     * Gets the name node of what's being imported.
     */
    getNameNode() {
        return this.getNodeFromCompilerNode(this.compilerNode.propertyName || this.compilerNode.name);
    }

    /**
     * Sets the alias for the name being imported and renames all the usages.
     * @param alias - Alias to set.
     */
    renameAlias(alias: string) {
        if (StringUtils.isNullOrWhitespace(alias)) {
            this.removeAliasWithRename();
            return this;
        }

        let aliasIdentifier = this.getAliasNode();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            this.setAlias(this.getName());
            aliasIdentifier = this.getAliasNode()!;
        }
        aliasIdentifier.rename(alias);
        return this;
    }

    /**
     * Sets the alias without renaming all the usages.
     * @param alias - Alias to set.
     */
    setAlias(alias: string) {
        if (StringUtils.isNullOrWhitespace(alias)) {
            this.removeAlias();
            return this;
        }

        const aliasIdentifier = this.getAliasNode();
        if (aliasIdentifier == null) {
            insertIntoParentTextRange({
                insertPos: this.getNameNode().getEnd(),
                parent: this,
                newText: ` as ${alias}`
            });
        }
        else
            aliasIdentifier.replaceWithText(alias);

        return this;
    }

    /**
     * Removes the alias without renaming.
     * @remarks Use removeAliasWithRename() if you want it to rename any usages to the name of the import specifier.
     */
    removeAlias() {
        const aliasIdentifier = this.getAliasNode();
        if (aliasIdentifier == null)
            return this;

        removeChildren({
            children: [this.getFirstChildByKindOrThrow(SyntaxKind.AsKeyword), aliasIdentifier],
            removePrecedingSpaces: true,
            removePrecedingNewLines: true
        });

        return this;
    }

    /**
     * Removes the alias and renames any usages to the name of the import specifier.
     */
    removeAliasWithRename() {
        const aliasIdentifier = this.getAliasNode();
        if (aliasIdentifier == null)
            return this;

        aliasIdentifier.rename(this.getName());
        this.removeAlias();

        return this;
    }

    /**
     * Gets the alias identifier, if it exists.
     */
    getAliasNode() {
        if (this.compilerNode.propertyName == null)
            return undefined;
        return this.getNodeFromCompilerNode(this.compilerNode.name);
    }

    /**
     * Gets the import declaration associated with this import specifier.
     */
    getImportDeclaration() {
        return this.getFirstAncestorByKindOrThrow(SyntaxKind.ImportDeclaration);
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

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure() {
        const alias = this.getAliasNode();
        return callBaseGetStructure<ImportSpecifierStructure>(Node.prototype, this, {
            name: this.getName(),
            alias: alias ? alias.getText() : undefined
        }) as ImportSpecifierStructure;
    }
}
