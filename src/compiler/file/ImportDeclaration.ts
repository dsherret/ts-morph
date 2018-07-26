import * as errors from "../../errors";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, removeChildren, verifyAndGetIndex } from "../../manipulation";
import { ImportSpecifierStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, ModuleUtils, StringUtils, TypeGuards } from "../../utils";
import { Identifier, Node } from "../common";
import { StringLiteral } from "../literal";
import { Statement } from "../statement";
import { ImportSpecifier } from "./ImportSpecifier";
import { SourceFile } from "./SourceFile";

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
        const text = typeof textOrSourceFile === "string" ? textOrSourceFile : this.sourceFile.getRelativePathAsModuleSpecifierTo(textOrSourceFile);
        this.getModuleSpecifier().setLiteralValue(text);
        return this;
    }

    /**
     * Gets the module specifier.
     */
    getModuleSpecifier(): StringLiteral {
        const moduleSpecifier =  this.getNodeFromCompilerNode(this.compilerNode.moduleSpecifier);
        if (!TypeGuards.isStringLiteral(moduleSpecifier))
            throw new errors.InvalidOperationError("Expected the module specifier to be a string literal.");
        return moduleSpecifier;
    }

    /**
     * Gets the module specifier string literal value.
     */
    getModuleSpecifierValue() {
        return this.getModuleSpecifier().getLiteralValue();
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
        const symbol = this.getModuleSpecifier().getSymbol();
        if (symbol == null)
            return undefined;
        return ModuleUtils.getReferencedSourceFileFromSymbol(symbol);
    }

    /**
     * Gets if the module specifier starts with `./` or `../`.
     */
    isModuleSpecifierRelative() {
        return ModuleUtils.isModuleSpecifierRelative(this.getModuleSpecifierValue());
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
     * Gets the default import or throws if it doesn't exit.
     */
    getDefaultImportOrThrow() {
        return errors.throwIfNullOrUndefined(this.getDefaultImport(), "Expected to find a default import.");
    }

    /**
     * Gets the default import or returns undefined if it doesn't exist.
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
        if (StringUtils.isNullOrWhitespace(text))
            return this.removeNamespaceImport();

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
     * Removes the namespace import.
     */
    removeNamespaceImport() {
        const namespaceImport = this.getNamespaceImport();
        if (namespaceImport == null)
            return this;

        removeChildren({
            children: getChildrenToRemove.call(this),
            removePrecedingSpaces: true,
            removePrecedingNewLines: true
        });

        return this;

        function getChildrenToRemove(this: ImportDeclaration) {
            const defaultImport = this.getDefaultImport();

            if (defaultImport == null)
                return [this.getImportClauseOrThrow(), this.getLastChildByKindOrThrow(SyntaxKind.FromKeyword)];
            else
                return [defaultImport.getNextSiblingIfKindOrThrow(SyntaxKind.CommaToken), namespaceImport];
        }
    }

    /**
     * Gets the namespace import if it exists or throws.
     */
    getNamespaceImportOrThrow() {
        return errors.throwIfNullOrUndefined(this.getNamespaceImport(), "Expected to find a namespace import.");
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
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the named import.
     */
    insertNamedImport(index: number, structure: ImportSpecifierStructure): ImportSpecifier;
    /**
     * Inserts a named import.
     * @param index - Child index to insert at.
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
     * @param index - Child index to insert at.
     * @param structuresOrNames - Structures or names that represent the named imports.
     */
    insertNamedImports(index: number, structuresOrNames: (ImportSpecifierStructure | string)[]) {
        if (ArrayUtils.isNullOrEmpty(structuresOrNames))
                return [];

        const namedImports = this.getNamedImports();
        const writer = this.getWriterWithQueuedChildIndentation();
        const namedImportStructurePrinter = this.context.structurePrinterFactory.forNamedImportExportSpecifier();
        const importClause = this.getImportClause();
        index = verifyAndGetIndex(index, namedImports.length);

        if (namedImports.length === 0) {
            namedImportStructurePrinter.printTextsWithBraces(writer, structuresOrNames);
            if (importClause == null)
                insertIntoParentTextRange({
                    insertPos: this.getFirstChildByKindOrThrow(SyntaxKind.ImportKeyword).getEnd(),
                    parent: this,
                    newText: ` ${writer.toString()} from`
                });
            else if (this.getNamespaceImport() != null)
                throw new errors.InvalidOperationError("Cannot add a named import to an import declaration that has a namespace import.");
            else
                insertIntoParentTextRange({
                    insertPos: this.getDefaultImport()!.getEnd(),
                    parent: importClause,
                    newText: `, ${writer.toString()}`
                });
        }
        else {
            if (importClause == null)
                throw new errors.NotImplementedError("Expected to have an import clause.");
            namedImportStructurePrinter.printTexts(writer, structuresOrNames);

            insertIntoCommaSeparatedNodes({
                parent: importClause.getFirstChildByKindOrThrow(SyntaxKind.NamedImports).getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                currentNodes: namedImports,
                insertIndex: index,
                newText: writer.toString(),
                surroundWithSpaces: this.context.getFormatCodeSettings().insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces
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

    /**
     * Gets the import clause or throws if it doesn't exist.
     */
    getImportClauseOrThrow(): Node {
        return errors.throwIfNullOrUndefined(this.getImportClause(), "Expected to find an import clause.");
    }

    /**
     * Gets the import clause or returns undefined if it doesn't exist.
     */
    getImportClause(): Node | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.importClause);
    }
}
