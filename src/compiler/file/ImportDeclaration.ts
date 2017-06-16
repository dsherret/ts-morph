import * as ts from "typescript";
import * as errors from "./../../errors";
import {ImportSpecifierStructure} from "./../../structures";
import {replaceStraight, insertStraight, verifyAndGetIndex, insertIntoCommaSeparatedNodes} from "./../../manipulation";
import {ArrayUtils} from "./../../utils";
import {Node, Identifier} from "./../common";
import {ImportSpecifier} from "./ImportSpecifier";

export class ImportDeclaration extends Node<ts.ImportDeclaration> {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the import specifier.
     */
    setModuleSpecifier(text: string) {
        const stringLiteral = this.getLastChildByKindOrThrow(ts.SyntaxKind.StringLiteral);
        replaceStraight(this.getSourceFile(), stringLiteral.getStart() + 1, stringLiteral.getWidth() - 2, text);
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
        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            defaultImport.rename(text);
            return this;
        }

        const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
        const importClause = this.getImportClause();
        if (importClause == null) {
            insertStraight(this.getSourceFile(), importKeyword.getEnd(), this, ` ${text} from`);
            return this;
        }

        // a namespace import or named import must exist... insert it beforehand
        insertStraight(this.getSourceFile(), importKeyword.getEnd(), importClause, ` ${text},`);
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
            insertStraight(this.getSourceFile(), defaultImport.getEnd(), this.getImportClause(), `, * as ${text}`);
            return this;
        }

        const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
        insertStraight(this.getSourceFile(), importKeyword.getEnd(), this, ` * as ${text} from`);
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
        index = verifyAndGetIndex(index, namedImports.length);

        if (namedImports.length === 0) {
            const importClause = this.getImportClause();
            if (importClause == null) {
                const importKeyword = this.getFirstChildByKindOrThrow(ts.SyntaxKind.ImportKeyword);
                insertStraight(this.getSourceFile(), importKeyword.getEnd(), this, ` {${codes.join(", ")}} from`);
            }
            else if (this.getNamespaceImport() != null)
                throw new errors.InvalidOperationError("Cannot add a named import to an import declaration that has a namespace import.");
            else
                insertStraight(this.getSourceFile(), this.getDefaultImport()!.getEnd(), importClause, `, {${codes.join(", ")}}`);
        }
        else {
            insertIntoCommaSeparatedNodes(this.getSourceFile(), namedImports, index, codes);
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
        return namedImports.getChildSyntaxListOrThrow().getChildren().filter(c => c instanceof ImportSpecifier) as ImportSpecifier[];
    }

    private getImportClause() {
        return this.getFirstChildByKind(ts.SyntaxKind.ImportClause) as Node<ts.ImportClause>;
    }
}
