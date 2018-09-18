import * as errors from "../../errors";
import { insertIntoParentTextRange, removeCommaSeparatedChild, replaceNodeText } from "../../manipulation";
import { SyntaxKind, ts } from "../../typescript";
import { TypeGuards } from "../../utils";
import { Node, Symbol } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { ExportSpecifierStructure } from "../../structures";

export class ExportSpecifier extends Node<ts.ExportSpecifier> {

export const ExportSpecifierBase = Node;
export class ExportSpecifier extends ExportSpecifierBase<ts.ExportSpecifier> {
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
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ExportSpecifierStructure>) {
        callBaseSet(ExportSpecifierBase.prototype, this, structure);

        if (structure.name != null)
            this.setName(structure.name);
        const aliasNode = this.getAliasNode();

        if (structure.alias != null) {
            if (aliasNode == null)
                addAlias(this, structure.alias);
            else
                aliasNode.replaceWithText(structure.alias);
        }
        else if (structure.hasOwnProperty(nameof(structure.alias)) && aliasNode != null)
            removeAlias(this, aliasNode);

        return this;
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
