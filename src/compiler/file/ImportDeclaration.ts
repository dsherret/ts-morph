import * as ts from "typescript";
import * as errors from "./../../errors";
import {ImportSpecifierStructure} from "./../../structures";
import {insertIntoParent, verifyAndGetIndex, insertIntoCommaSeparatedNodes, removeStatementedNodeChild, removeChildren} from "./../../manipulation";
import {ArrayUtils, TypeGuards} from "./../../utils";
import {Node, Identifier} from "./../common";
import {ImportSpecifier} from "./ImportSpecifier";

export class ImportDeclaration extends Node<ts.ImportDeclaration> {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the import specifier.
     */
    setModuleSpecifier(text: string) {
        const stringLiteral = this.getLastChildByKindOrThrow(ts.SyntaxKind.StringLiteral);
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
        return this;
    }

    /**
     * Gets the module specifier.
     */
    getModuleSpecifier() {
        const stringLiteral = this.getLastChildByKindOrThrow(ts.SyntaxKind.StringLiteral);
        const text = stringLiteral.getText();
        return text.substring(1, text.length - 1);
    }

    /**
     * Sets the default import.
     * @param text - Text to set as the default import.
     */
    setDefaultImport(text: string) {
        errors.throwIfNotStringOrWhitespace(text, nameof(text));

        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            defaultImport.rename(text);
            return this;
        }

        const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
        const importClause = this.getImportClause();
        if (importClause == null) {
            insertIntoParent({
                insertPos: importKeyword.getEnd(),
                childIndex: importKeyword.getChildIndex() + 1,
                insertItemsCount: 2, // ImportClause, FromKeyword
                parent: this,
                newText: ` ${text} from`
            });
            return this;
        }

        // a namespace import or named import must exist... insert it beforehand
        insertIntoParent({
            insertPos: importKeyword.getEnd(),
            childIndex: 0,
            insertItemsCount: 2, // Identifier, CommaToken
            parent: importClause,
            newText: ` ${text},`
        });
        return this;
    }

    /**
     * Gets the default import, if it exists.
     */
    getDefaultImport() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return undefined;
        const firstChild = importClause.getFirstChild();
        if (firstChild == null || firstChild.getKind() !== ts.SyntaxKind.Identifier)
            return undefined;
        return firstChild as Identifier;
    }

    /**
     * Sets the namespace import.
     * @param text - Text to set as the namespace import.
     * @throws - InvalidOperationError if a named import exists.
     */
    setNamespaceImport(text: string) {
        const namespaceImport = this.getNamespaceImport();
        if (namespaceImport != null) {
            namespaceImport.rename(text);
            return this;
        }

        if (this.getNamedImports().length > 0)
            throw new errors.InvalidOperationError("Cannot add a namespace import to an import declaration that has named imports.");

        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            insertIntoParent({
                insertPos: defaultImport.getEnd(),
                childIndex: defaultImport.getChildIndex() + 1,
                insertItemsCount: 2, // CommaToken, NamespaceImport
                parent: this.getImportClause()!,
                newText: `, * as ${text}`
            });
            return this;
        }

        const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
        insertIntoParent({
            insertPos: importKeyword.getEnd(),
            childIndex: importKeyword.getChildIndex() + 1,
            insertItemsCount: 2, // ImportClause, FromKeyword
            parent: this,
            newText: ` * as ${text} from`
        });
        return this;
    }

    /**
     * Gets the namespace import, if it exists.
     */
    getNamespaceImport() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return undefined;
        const namespaceImport = importClause.getFirstChildByKind(ts.SyntaxKind.NamespaceImport);
        if (namespaceImport == null)
            return undefined;
        return namespaceImport.getFirstChildByKind(ts.SyntaxKind.Identifier) as Identifier | undefined;
    }

    /**
     * Add a named import.
     * @param structure - Structure that represents the named import.
     */
    addNamedImport(structure: ImportSpecifierStructure) {
        return this.addNamedImports([structure])[0];
    }

    /**
     * Add named imports.
     * @param structures - Structures that represent the named imports.
     */
    addNamedImports(structures: ImportSpecifierStructure[]) {
        return this.insertNamedImports(this.getNamedImports().length, structures);
    }

    /**
     * Insert a named import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the named import.
     */
    insertNamedImport(index: number, structure: ImportSpecifierStructure) {
        return this.insertNamedImports(index, [structure])[0];
    }

    /**
     * Inserts named imports into the import declaration.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the named imports.
     */
    insertNamedImports(index: number, structures: ImportSpecifierStructure[]) {
        if (ArrayUtils.isNullOrEmpty(structures))
                return [];

        const namedImports = this.getNamedImports();
        const codes = structures.map(s => {
            let text = s.name;
            if (s.alias != null && s.alias.length > 0)
                text += ` as ${s.alias}`;
            return text;
        });
        const importClause = this.getImportClause();
        index = verifyAndGetIndex(index, namedImports.length);

        if (namedImports.length === 0) {
            if (importClause == null) {
                const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
                insertIntoParent({
                    insertPos: importKeyword.getEnd(),
                    childIndex: importKeyword.getChildIndex() + 1,
                    insertItemsCount: 2, // NamedImports, FromKeyword
                    parent: this,
                    newText: ` {${codes.join(", ")}} from`
                });
            }
            else if (this.getNamespaceImport() != null)
                throw new errors.InvalidOperationError("Cannot add a named import to an import declaration that has a namespace import.");
            else {
                const defaultImport = this.getDefaultImport()!;
                insertIntoParent({
                    insertPos: defaultImport.getEnd(),
                    childIndex: defaultImport.getChildIndex() + 1,
                    insertItemsCount: 2, // CommaToken, NamedImports
                    parent: importClause,
                    newText: `, {${codes.join(", ")}}`
                });
            }
        }
        else {
            if (importClause == null)
                throw new errors.NotImplementedError("Expected to have an import clause.");

            insertIntoCommaSeparatedNodes({
                parent: importClause.getFirstChildByKindOrThrow(ts.SyntaxKind.NamedImports).getFirstChildByKindOrThrow(ts.SyntaxKind.SyntaxList),
                currentNodes: namedImports,
                insertIndex: index,
                newTexts: codes
            });
        }

        return this.getNamedImports().slice(index, index + structures.length);
    }

    /**
     * Gets the named imports.
     */
    getNamedImports(): ImportSpecifier[] {
        const importClause = this.getImportClause();
        if (importClause == null)
            return [];
        const namedImports = importClause.getFirstChildByKind(ts.SyntaxKind.NamedImports);
        if (namedImports == null)
            return [];
        return namedImports.getChildSyntaxListOrThrow().getChildren().filter(c => TypeGuards.isImportSpecifier(c)) as ImportSpecifier[];
    }

    /**
     * Removes all the named imports.
     */
    removeNamedImports(): this {
        const importClause = this.getImportClause();
        if (importClause == null)
            return this;

        const namedImportsNode = importClause.getFirstChildByKind(ts.SyntaxKind.NamedImports);
        if (namedImportsNode == null)
            return this;

        // ex. import defaultExport, {Export1} from "module-name";
        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            const commaToken = defaultImport.getNextSiblingIfKindOrThrow(ts.SyntaxKind.CommaToken);
            removeChildren({ children: [commaToken, namedImportsNode] });
            return this;
        }

        // ex. import {Export1} from "module-name";
        const fromKeyword = importClause.getNextSiblingIfKindOrThrow(ts.SyntaxKind.FromKeyword);
        removeChildren({ children: [importClause, fromKeyword], removePrecedingSpaces: true });
        return this;
    }

    /**
     * Removes this import declaration.
     */
    remove() {
        removeStatementedNodeChild(this);
    }

    private getImportClause() {
        return this.getFirstChildByKind(ts.SyntaxKind.ImportClause) as Node<ts.ImportClause> | undefined;
    }
}
