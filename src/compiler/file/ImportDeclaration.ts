import {ts, SyntaxKind} from "../../typescript";
import * as errors from "../../errors";
import {ImportSpecifierStructure} from "../../structures";
import {insertIntoParentTextRange, verifyAndGetIndex, insertIntoCommaSeparatedNodes, removeChildren, getNodesToReturn} from "../../manipulation";
import {ArrayUtils, TypeGuards, StringUtils, ModuleUtils} from "../../utils";
import {Identifier} from "../common";
import {Statement} from "../statement";
import {ImportSpecifier} from "./ImportSpecifier";
import {SourceFile} from "./SourceFile";

export class ImportDeclaration extends Statement<ts.ImportDeclaration> {
    /**
     * Sets the import specifier.
     * @param text - Text to set as the module specifier.
     */
    setModuleSpecifier(text: string): this;
    /**
     * Sets the import specifier.
     * @param sourceFile - Source file to set the module specifier from.
     */
    setModuleSpecifier(sourceFile: SourceFile): this;
    setModuleSpecifier(textOrSourceFile: string | SourceFile) {
        const text = typeof textOrSourceFile === "string" ? textOrSourceFile : this.sourceFile.getRelativePathToSourceFileAsModuleSpecifier(textOrSourceFile);
        this.getLastChildByKindOrThrow(SyntaxKind.StringLiteral).setLiteralValue(text);
        return this;
    }

    /**
     * Gets the module specifier.
     */
    getModuleSpecifier() {
        const moduleSpecifier = this.getNodeFromCompilerNode(this.compilerNode.moduleSpecifier);
        const text = moduleSpecifier.getText();
        return text.substring(1, text.length - 1);
    }

    /**
     * Gets the source file referenced in the module specifier or throws if it can't find it.
     */
    getModuleSpecifierSourceFileOrThrow() {
        return errors.throwIfNullOrUndefined(this.getModuleSpecifierSourceFile(), `A module specifier source file was expected.`);
    }

    /**
     * Gets the source file referenced in the module specifier or returns undefined if it can't find it.
     */
    getModuleSpecifierSourceFile() {
        const moduleSpecifier = this.getNodeFromCompilerNode(this.compilerNode.moduleSpecifier);
        const symbol = moduleSpecifier.getSymbol();
        if (symbol == null)
            return undefined;
        return ModuleUtils.getReferencedSourceFileFromSymbol(symbol);
    }

    /**
     * Gets if the module specifier starts with `./` or `../`.
     */
    isModuleSpecifierRelative() {
        return ModuleUtils.isModuleSpecifierRelative(this.getModuleSpecifier());
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

        const importKeyword = this.getFirstChildByKindOrThrow(SyntaxKind.ImportKeyword);
        const importClause = this.getImportClause();
        if (importClause == null) {
            insertIntoParentTextRange({
                insertPos: importKeyword.getEnd(),
                parent: this,
                newText: ` ${text} from`
            });
            return this;
        }

        // a namespace import or named import must exist... insert it beforehand
        insertIntoParentTextRange({
            insertPos: importKeyword.getEnd(),
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
        if (firstChild == null || firstChild.getKind() !== SyntaxKind.Identifier)
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
            insertIntoParentTextRange({
                insertPos: defaultImport.getEnd(),
                parent: this.getImportClause()!,
                newText: `, * as ${text}`
            });
            return this;
        }

        insertIntoParentTextRange({
            insertPos: this.getFirstChildByKindOrThrow(SyntaxKind.ImportKeyword).getEnd(),
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
        const namespaceImport = importClause.getFirstChildByKind(SyntaxKind.NamespaceImport);
        if (namespaceImport == null)
            return undefined;
        return namespaceImport.getFirstChildByKind(SyntaxKind.Identifier);
    }

    /**
     * Adds a named import.
     * @param structure - Structure that represents the named import.
     */
    addNamedImport(structure: ImportSpecifierStructure): ImportSpecifier;
    /**
     * Adds a named import.
     * @param name - Name of the named import.
     */
    addNamedImport(name: string): ImportSpecifier;
    /** @internal */
    addNamedImport(structureOrName: ImportSpecifierStructure | string): ImportSpecifier;
    addNamedImport(structureOrName: ImportSpecifierStructure | string) {
        return this.addNamedImports([structureOrName])[0];
    }

    /**
     * Adds named imports.
     * @param structuresOrNames - Structures or names that represent the named imports.
     */
    addNamedImports(structuresOrNames: (ImportSpecifierStructure | string)[]) {
        return this.insertNamedImports(this.getNamedImports().length, structuresOrNames);
    }

    /**
     * Inserts a named import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the named import.
     */
    insertNamedImport(index: number, structure: ImportSpecifierStructure): ImportSpecifier;
    /**
     * Inserts a named import.
     * @param index - Index to insert at.
     * @param name - Name of the named import.
     */
    insertNamedImport(index: number, name: string): ImportSpecifier;
    /** @internal */
    insertNamedImport(index: number, structureOrName: ImportSpecifierStructure | string): ImportSpecifier;
    insertNamedImport(index: number, structureOrName: ImportSpecifierStructure | string) {
        return this.insertNamedImports(index, [structureOrName])[0];
    }

    /**
     * Inserts named imports into the import declaration.
     * @param index - Index to insert at.
     * @param structuresOrNames - Structures or names that represent the named imports.
     */
    insertNamedImports(index: number, structuresOrNames: (ImportSpecifierStructure | string)[]) {
        if (ArrayUtils.isNullOrEmpty(structuresOrNames))
                return [];

        const namedImports = this.getNamedImports();
        const codes = structuresOrNames.map(s => {
            if (typeof s === "string")
                return s;
            let text = s.name;
            if (s.alias != null && s.alias.length > 0)
                text += ` as ${s.alias}`;
            return text;
        });
        const importClause = this.getImportClause();
        index = verifyAndGetIndex(index, namedImports.length);

        if (namedImports.length === 0) {
            if (importClause == null)
                insertIntoParentTextRange({
                    insertPos: this.getFirstChildByKindOrThrow(SyntaxKind.ImportKeyword).getEnd(),
                    parent: this,
                    newText: ` {${codes.join(", ")}} from`
                });
            else if (this.getNamespaceImport() != null)
                throw new errors.InvalidOperationError("Cannot add a named import to an import declaration that has a namespace import.");
            else
                insertIntoParentTextRange({
                    insertPos: this.getDefaultImport()!.getEnd(),
                    parent: importClause,
                    newText: `, {${codes.join(", ")}}`
                });
        }
        else {
            if (importClause == null)
                throw new errors.NotImplementedError("Expected to have an import clause.");

            insertIntoCommaSeparatedNodes({
                parent: importClause.getFirstChildByKindOrThrow(SyntaxKind.NamedImports).getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                currentNodes: namedImports,
                insertIndex: index,
                newTexts: codes
            });
        }

        return getNodesToReturn(this.getNamedImports(), index, structuresOrNames.length);
    }

    /**
     * Gets the named imports.
     */
    getNamedImports(): ImportSpecifier[] {
        const importClause = this.getImportClause();
        if (importClause == null)
            return [];
        const namedImports = importClause.getFirstChildByKind(SyntaxKind.NamedImports);
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

        const namedImportsNode = importClause.getFirstChildByKind(SyntaxKind.NamedImports);
        if (namedImportsNode == null)
            return this;

        // ex. import defaultExport, {Export1} from "module-name";
        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            const commaToken = defaultImport.getNextSiblingIfKindOrThrow(SyntaxKind.CommaToken);
            removeChildren({ children: [commaToken, namedImportsNode] });
            return this;
        }

        // ex. import {Export1} from "module-name";
        const fromKeyword = importClause.getNextSiblingIfKindOrThrow(SyntaxKind.FromKeyword);
        removeChildren({ children: [importClause, fromKeyword], removePrecedingSpaces: true });
        return this;
    }

    private getImportClause() {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.importClause);
    }
}
