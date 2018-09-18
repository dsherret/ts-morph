import { insertIntoParentTextRange, removeCommaSeparatedChild, removeChildren } from "../../manipulation";
import { SyntaxKind, ts } from "../../typescript";
import { TypeGuards } from "../../utils";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { ImportSpecifierStructure } from "../../structures";

export const ImportSpecifierBase = Node;
export class ImportSpecifier extends ImportSpecifierBase<ts.ImportSpecifier> {
    /**
     * Sets the identifier being imported.
     * @param name - Name being imported.
     */
    setName(name: string) {
        const nameNode = this.getNameNode();
        if (nameNode.getText() === name)
            return this;

        nameNode.replaceWithText(name);

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
     * Sets the alias for the name being imported.
     * @param alias - Alias to set.
     */
    setAlias(alias: string) {
        let aliasIdentifier = this.getAliasNode();
        if (aliasIdentifier == null) {
            // trick is to insert an alias with the same name, then rename the alias. TS compiler will take care of the rest.
            addAlias(this, this.getName());
            aliasIdentifier = this.getAliasNode()!;
        }
        aliasIdentifier.rename(alias);
        return this;
    }

    /**
     * Removes the alias.
     */
    removeAlias() {
        const aliasIdentifier = this.getAliasNode();
        if (aliasIdentifier == null)
            return this;

        aliasIdentifier.rename(this.getName());
        removeAlias(this, aliasIdentifier);

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
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ImportSpecifierStructure>) {
        callBaseSet(ImportSpecifierBase.prototype, this, structure);

        if (structure.name != null && structure.hasOwnProperty(nameof(structure.alias))) {
            this.setName(structure.name);
            const aliasNode = this.getAliasNode();

            if (structure.alias != null) {
                if (aliasNode == null)
                    addAlias(this, structure.alias);
                else
                    aliasNode.replaceWithText(structure.alias);
            }
            else if (aliasNode != null)
                removeAlias(this, aliasNode);
        }
        else {
            if (structure.name != null)
                this.setName(structure.name);
            if (structure.alias != null)
                this.setAlias(structure.alias);
            else if (structure.hasOwnProperty(nameof(structure.alias)))
                this.removeAlias();
        }

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure() {
        const alias = this.getAliasNode();
        return callBaseGetStructure<ImportSpecifierStructure>(ImportSpecifierBase.prototype, this, {
            name: this.getName(),
            alias: alias ? alias.getText() : undefined
        }) as ImportSpecifierStructure;
    }
}

function addAlias(node: ImportSpecifier, alias: string) {
    const nameNode = node.getNameNode();
    insertIntoParentTextRange({
        insertPos: nameNode.getEnd(),
        parent: node,
        newText: ` as ${alias}`
    });
}

function removeAlias(node: ImportSpecifier, aliasIdentifier: Node) {
    removeChildren({
        children: [node.getFirstChildByKindOrThrow(SyntaxKind.AsKeyword), aliasIdentifier],
        removePrecedingSpaces: true,
        removePrecedingNewLines: true
    });
}
