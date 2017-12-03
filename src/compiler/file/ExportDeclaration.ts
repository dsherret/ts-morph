import * as ts from "typescript";
import * as errors from "./../../errors";
import {ExportSpecifierStructure} from "./../../structures";
import {insertIntoParent, verifyAndGetIndex, insertIntoCommaSeparatedNodes, removeStatementedNodeChild} from "./../../manipulation";
import {ArrayUtils, TypeGuards} from "./../../utils";
import {Node, Identifier} from "./../common";
import {ExportSpecifier} from "./ExportSpecifier";

export class ExportDeclaration extends Node<ts.ExportDeclaration> {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the import specifier.
     */
    setModuleSpecifier(text: string) {
        const stringLiteral = this.getLastChildByKind(ts.SyntaxKind.StringLiteral);

        if (stringLiteral == null) {
            const semiColonToken = this.getLastChildIfKind(ts.SyntaxKind.SemicolonToken);
            const stringChar = this.global.manipulationSettings.getStringChar();
            insertIntoParent({
                insertPos: semiColonToken != null ? semiColonToken.getPos() : this.getEnd(),
                childIndex: semiColonToken != null ? semiColonToken.getChildIndex() : this.getChildCount(),
                insertItemsCount: 2, // FromKeyword, StringLiteral
                parent: this,
                newText: ` from ${stringChar}${text}${stringChar}`
            });
        }
        else {
            insertIntoParent({
                parent: this,
                newText: text,
                insertPos: stringLiteral.getStart() + 1,
                childIndex: stringLiteral.getChildIndex(),
                insertItemsCount: 1,
                replacing: {
                    textLength: stringLiteral.getWidth() - 2,
                    nodes: [stringLiteral]
                }
            });
        }

        return this;
    }

    /**
     * Gets the module specifier or undefined if it doesn't exist.
     */
    getModuleSpecifier() {
        const stringLiteral = this.getLastChildByKind(ts.SyntaxKind.StringLiteral);
        if (stringLiteral == null)
            return undefined;
        const text = stringLiteral.getText();
        return text.substring(1, text.length - 1);
    }

    /**
     * Gets if the module specifier exists
     */
    hasModuleSpecifier() {
        return this.getLastChildByKind(ts.SyntaxKind.StringLiteral) != null;
    }

    /**
     * Gets if this export declaration is a namespace export.
     */
    isNamespaceExport() {
        return !this.hasNamedExports();
    }

    /**
     * Gets if the export declaration has named exports.
     */
    hasNamedExports() {
        return this.getFirstChildByKind(ts.SyntaxKind.NamedExports) != null;
    }

    /**
     * Add a named export.
     * @param structure - Structure that represents the named export.
     */
    addNamedExport(structure: ExportSpecifierStructure) {
        return this.addNamedExports([structure])[0];
    }

    /**
     * Add named exports.
     * @param structures - Structures that represent the named exports.
     */
    addNamedExports(structures: ExportSpecifierStructure[]) {
        return this.insertNamedExports(this.getNamedExports().length, structures);
    }

    /**
     * Insert a named export.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the named export.
     */
    insertNamedExport(index: number, structure: ExportSpecifierStructure) {
        return this.insertNamedExports(index, [structure])[0];
    }

    /**
     * Inserts named exports into the export declaration.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the named exports.
     */
    insertNamedExports(index: number, structures: ExportSpecifierStructure[]) {
        if (ArrayUtils.isNullOrEmpty(structures))
                return [];

        const namedExports = this.getNamedExports();
        const codes = structures.map(s => {
            let text = s.name;
            if (s.alias != null && s.alias.length > 0)
                text += ` as ${s.alias}`;
            return text;
        });
        index = verifyAndGetIndex(index, namedExports.length);

        if (namedExports.length === 0) {
            const asteriskToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.AsteriskToken);
            insertIntoParent({
                insertPos: asteriskToken.getStart(),
                parent: this,
                newText: `{${codes.join(", ")}}`,
                childIndex: asteriskToken.getChildIndex(),
                insertItemsCount: 1,
                replacing: {
                    nodes: [asteriskToken],
                    textLength: 1
                }
            });
        }
        else {
            insertIntoCommaSeparatedNodes({
                parent: this.getFirstChildByKindOrThrow(ts.SyntaxKind.NamedExports).getFirstChildByKindOrThrow(ts.SyntaxKind.SyntaxList),
                currentNodes: namedExports,
                insertIndex: index,
                newTexts: codes
            });
        }

        return this.getNamedExports().slice(index, index + structures.length);
    }

    /**
     * Gets the named exports.
     */
    getNamedExports(): ExportSpecifier[] {
        const namedExports = this.getFirstChildByKind(ts.SyntaxKind.NamedExports);
        if (namedExports == null)
            return [];
        return namedExports.getChildSyntaxListOrThrow().getChildren().filter(c => TypeGuards.isExportSpecifier(c)) as ExportSpecifier[];
    }

    /**
     * Changes the export declaration to namespace export. Removes all the named exports.
     */
    toNamespaceExport(): this {
        if (!this.hasModuleSpecifier())
            throw new errors.InvalidOperationError("Cannot change to a namespace export when no module specifier exists.");

        const namedExportsNode = this.getFirstChildByKind(ts.SyntaxKind.NamedExports);
        if (namedExportsNode == null)
            return this;

        insertIntoParent({
            parent: this,
            newText: "*",
            insertPos: namedExportsNode.getStart(),
            childIndex: namedExportsNode.getChildIndex(),
            insertItemsCount: 1,
            replacing: {
                textLength: namedExportsNode.getWidth(),
                nodes: [namedExportsNode]
            }
        });
        return this;
    }

    /**
     * Removes this export declaration.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
