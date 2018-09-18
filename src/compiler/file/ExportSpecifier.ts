import * as errors from "../../errors";
import { insertIntoParentTextRange, removeCommaSeparatedChild, replaceNodeText, removeChildren } from "../../manipulation";
import { SyntaxKind, ts } from "../../typescript";
import { StringUtils } from "../../utils";
import { Node, Symbol } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ExportSpecifierStructure } from "../../structures";

// todo: There's a lot of common code that could be shared with ImportSpecifier. It could be moved to a mixin.

export class ExportSpecifier extends Node<ts.ExportSpecifier> {
    /**
     * Sets the name of what's being exported.
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
     * Gets the name of the export specifier.
     */
    getName() {
        return this.getNameNode().getText();
    }

    /**
     * Gets the name node of what's being exported.
     */
    getNameNode() {
        return this.getNodeFromCompilerNode(this.compilerNode.propertyName || this.compilerNode.name);
    }

    /**
     * Sets the alias for the name being exported.
     * @param alias - Alias to set.
     */
    setAlias(alias: string) {
        let aliasIdentifier = this.getAliasNode();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            const nameNode = this.getNameNode();
            insertIntoParentTextRange({
                insertPos: nameNode.getEnd(),
                parent: this,
                newText: ` as ${nameNode.getText()}`
            });
            aliasIdentifier = this.getAliasNode()!;
        }
        aliasIdentifier.rename(alias);
        return this;
    }

    /**
     * Removes the alias without renaming.
     * @remarks Use removeAliasWithRename() if you want it to rename any usages to the name of the export specifier.
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
     * Removes the alias and renames any usages to the name of the export specifier.
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
     * Gets the export declaration associated with this export specifier.
     */
    getExportDeclaration() {
        return this.getFirstAncestorByKindOrThrow(SyntaxKind.ExportDeclaration);
    }

    /**
     * Gets the local target symbol of the export specifier or throws if it doesn't exist.
     */
    getLocalTargetSymbolOrThrow() {
        return errors.throwIfNullOrUndefined(this.getLocalTargetSymbol(), `The export specifier's local target symbol was expected.`);
    }

    /**
     * Gets the local target symbol of the export specifier or undefined if it doesn't exist.
     */
    getLocalTargetSymbol(): Symbol | undefined {
        return this.context.typeChecker.getExportSpecifierLocalTargetSymbol(this);
    }

    /**
     * Gets all the declarations referenced by the export specifier.
     */
    getLocalTargetDeclarations(): Node[] {
        const symbol = this.getLocalTargetSymbol();
        return symbol == null ? [] : symbol.getDeclarations();
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

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ExportSpecifierStructure {
        const alias = this.getAliasNode();
        return callBaseGetStructure<ExportSpecifierStructure>(Node.prototype, this, {
            alias: alias ? alias.getText() : undefined,
            name: this.getNameNode().getText()
        });
    }
}
