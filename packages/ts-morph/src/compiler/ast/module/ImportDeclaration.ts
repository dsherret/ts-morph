import { errors, ArrayUtils, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, removeChildren, verifyAndGetIndex } from "../../../manipulation";
import { ImportSpecifierStructure, ImportDeclarationStructure, ImportDeclarationSpecificStructure, StructureKind, OptionalKind } from "../../../structures";
import { WriterFunction } from "../../../types";
import { ModuleUtils } from "../../../utils";
import { StringLiteral } from "../literal";
import { Statement } from "../statement";
import { ImportSpecifier } from "./ImportSpecifier";
import { SourceFile } from "./SourceFile";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";

export const ImportDeclarationBase = Statement;
export class ImportDeclaration extends ImportDeclarationBase<ts.ImportDeclaration> {
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
        const text = typeof textOrSourceFile === "string" ? textOrSourceFile : this._sourceFile.getRelativePathAsModuleSpecifierTo(textOrSourceFile);
        this.getModuleSpecifier().setLiteralValue(text);
        return this;
    }

    /**
     * Gets the module specifier.
     */
    getModuleSpecifier(): StringLiteral {
        const moduleSpecifier = this._getNodeFromCompilerNode(this.compilerNode.moduleSpecifier);
        if (!Node.isStringLiteral(moduleSpecifier))
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
     * @remarks Use renameDefaultImport to rename.
     */
    setDefaultImport(text: string) {
        if (StringUtils.isNullOrWhitespace(text))
            return this.removeDefaultImport();

        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            defaultImport.replaceWithText(text);
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
     * Renames or sets the provided default import.
     * @param text - Text to set or rename the default import with.
     */
    renameDefaultImport(text: string) {
        if (StringUtils.isNullOrWhitespace(text))
            return this.removeDefaultImport();

        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            defaultImport.rename(text);
            return this;
        }

        this.setDefaultImport(text);
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
        return this.getImportClause()?.getDefaultImport() ?? undefined; // bug in compiler, shouldn't need this null coalescing
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
                return [defaultImport.getNextSiblingIfKindOrThrow(SyntaxKind.CommaToken), namespaceImport!];
        }
    }

    /**
     * Removes the default import.
     */
    removeDefaultImport() {
        const importClause = this.getImportClause();
        if (importClause == null)
            return this;
        const defaultImport = importClause.getDefaultImport();
        if (defaultImport == null)
            return this;

        const hasOnlyDefaultImport = importClause.getChildCount() === 1;
        if (hasOnlyDefaultImport) {
            removeChildren({
                children: [importClause, importClause.getNextSiblingIfKindOrThrow(SyntaxKind.FromKeyword)],
                removePrecedingSpaces: true,
                removePrecedingNewLines: true
            });
        }
        else {
            removeChildren({
                children: [defaultImport, defaultImport.getNextSiblingIfKindOrThrow(SyntaxKind.CommaToken)],
                removePrecedingSpaces: true,
                removePrecedingNewLines: true
            });
        }

        return this;
    }

    /**
     * Gets the namespace import if it exists or throws.
     */
    getNamespaceImportOrThrow() {
        return errors.throwIfNullOrUndefined(this.getNamespaceImport(), "Expected to find a namespace import.");
    }

    /**
     * Gets the namespace import identifier, if it exists.
     */
    getNamespaceImport() {
        return this.getImportClause()?.getNamespaceImport() ?? undefined; // bug in compiler, shouldn't need the ??
    }

    /**
     * Adds a named import.
     * @param namedImport - Name, structure, or writer to write the named import with.
     */
    addNamedImport(namedImport: OptionalKind<ImportSpecifierStructure> | string | WriterFunction) {
        return this.addNamedImports([namedImport])[0];
    }

    /**
     * Adds named imports.
     * @param namedImport - Structures, names, or writer function to write the named import with.
     */
    addNamedImports(namedImports: ReadonlyArray<OptionalKind<ImportSpecifierStructure> | string | WriterFunction> | WriterFunction) {
        return this.insertNamedImports(this.getNamedImports().length, namedImports);
    }

    /**
     * Inserts a named import.
     * @param index - Child index to insert at.
     * @param namedImport - Structure, name, or writer function to write the named import with.
     */
    insertNamedImport(index: number, namedImport: OptionalKind<ImportSpecifierStructure> | string | WriterFunction) {
        return this.insertNamedImports(index, [namedImport])[0];
    }

    /**
     * Inserts named imports into the import declaration.
     * @param index - Child index to insert at.
     * @param namedImports - Structures, names, or writer function to write the named import with.
     */
    insertNamedImports(index: number, namedImports: ReadonlyArray<OptionalKind<ImportSpecifierStructure> | string | WriterFunction> | WriterFunction) {
        if (!(namedImports instanceof Function) && ArrayUtils.isNullOrEmpty(namedImports))
            return [];

        const originalNamedImports = this.getNamedImports();
        const writer = this._getWriterWithQueuedIndentation();
        const namedImportStructurePrinter = this._context.structurePrinterFactory.forNamedImportExportSpecifier();
        const importClause = this.getImportClause();
        index = verifyAndGetIndex(index, originalNamedImports.length);

        if (originalNamedImports.length === 0) {
            namedImportStructurePrinter.printTextsWithBraces(writer, namedImports);
            if (importClause == null) {
                insertIntoParentTextRange({
                    insertPos: this.getFirstChildByKindOrThrow(SyntaxKind.ImportKeyword).getEnd(),
                    parent: this,
                    newText: ` ${writer.toString()} from`
                });
            }
            else if (this.getNamespaceImport() != null)
                throw getErrorWhenNamespaceImportsExist();
            else if (importClause.getNamedBindings() != null) {
                const namedBindings = importClause.getNamedBindingsOrThrow();
                insertIntoParentTextRange({
                    insertPos: namedBindings.getStart(),
                    replacing: {
                        textLength: namedBindings.getWidth()
                    },
                    parent: importClause,
                    newText: writer.toString()
                });
            }
            else {
                insertIntoParentTextRange({
                    insertPos: this.getDefaultImport()!.getEnd(),
                    parent: importClause,
                    newText: `, ${writer.toString()}`
                });
            }
        }
        else {
            if (importClause == null)
                throw new errors.NotImplementedError("Expected to have an import clause.");
            namedImportStructurePrinter.printTexts(writer, namedImports);

            insertIntoCommaSeparatedNodes({
                parent: importClause.getFirstChildByKindOrThrow(SyntaxKind.NamedImports).getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                currentNodes: originalNamedImports,
                insertIndex: index,
                newText: writer.toString(),
                surroundWithSpaces: this._context.getFormatCodeSettings().insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces,
                useTrailingCommas: false
            });
        }

        const newNamedImports = this.getNamedImports();
        return getNodesToReturn(originalNamedImports, newNamedImports, index, false);
    }

    /**
     * Gets the named imports.
     */
    getNamedImports(): ImportSpecifier[] {
        return this.getImportClause()?.getNamedImports() ?? [];
    }

    /**
     * Removes all the named imports.
     */
    removeNamedImports(): this {
        const importClause = this.getImportClause();
        if (importClause == null)
            return this;

        const namedImportsNode = importClause.getNamedBindings();
        if (namedImportsNode == null || namedImportsNode.getKind() !== SyntaxKind.NamedImports)
            return this;

        // ex. import defaultExport, { Export1 } from "module-name";
        const defaultImport = this.getDefaultImport();
        if (defaultImport != null) {
            const commaToken = defaultImport.getNextSiblingIfKindOrThrow(SyntaxKind.CommaToken);
            removeChildren({ children: [commaToken, namedImportsNode] });
            return this;
        }

        // ex. import { Export1 } from "module-name";
        const fromKeyword = importClause.getNextSiblingIfKindOrThrow(SyntaxKind.FromKeyword);
        removeChildren({ children: [importClause, fromKeyword], removePrecedingSpaces: true });
        return this;
    }

    /**
     * Gets the import clause or throws if it doesn't exist.
     */
    getImportClauseOrThrow() {
        return errors.throwIfNullOrUndefined(this.getImportClause(), "Expected to find an import clause.");
    }

    /**
     * Gets the import clause or returns undefined if it doesn't exist.
     */
    getImportClause() {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.importClause);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ImportDeclarationStructure>) {
        callBaseSet(ImportDeclarationBase.prototype, this, structure);

        if (structure.defaultImport != null)
            this.setDefaultImport(structure.defaultImport);
        else if (structure.hasOwnProperty(nameof(structure.defaultImport)))
            this.removeDefaultImport();

        if (structure.hasOwnProperty(nameof(structure.namedImports)))
            this.removeNamedImports();

        if (structure.namespaceImport != null)
            this.setNamespaceImport(structure.namespaceImport);
        else if (structure.hasOwnProperty(nameof(structure.namespaceImport)))
            this.removeNamespaceImport();

        if (structure.namedImports != null) {
            setEmptyNamedImport(this);
            this.addNamedImports(structure.namedImports);
        }

        if (structure.moduleSpecifier != null)
            this.setModuleSpecifier(structure.moduleSpecifier);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ImportDeclarationStructure {
        const namespaceImport = this.getNamespaceImport();
        const defaultImport = this.getDefaultImport();

        return callBaseGetStructure<ImportDeclarationSpecificStructure>(ImportDeclarationBase.prototype, this, {
            kind: StructureKind.ImportDeclaration,
            defaultImport: defaultImport ? defaultImport.getText() : undefined,
            moduleSpecifier: this.getModuleSpecifier().getLiteralText(),
            namedImports: this.getNamedImports().map(node => node.getStructure()),
            namespaceImport: namespaceImport ? namespaceImport.getText() : undefined
        });
    }
}

function setEmptyNamedImport(node: ImportDeclaration) {
    const importClause = node.getNodeProperty("importClause");
    const writer = node._getWriterWithQueuedChildIndentation();
    const namedImportStructurePrinter = node._context.structurePrinterFactory.forNamedImportExportSpecifier();
    namedImportStructurePrinter.printTextsWithBraces(writer, []);
    const emptyBracesText = writer.toString();

    if (node.getNamespaceImport() != null)
        throw getErrorWhenNamespaceImportsExist();

    if (importClause == null) {
        insertIntoParentTextRange({
            insertPos: node.getFirstChildByKindOrThrow(SyntaxKind.ImportKeyword).getEnd(),
            parent: node,
            newText: ` ${emptyBracesText} from`
        });
        return;
    }

    const replaceNode = importClause.getNamedBindings();
    if (replaceNode != null) {
        insertIntoParentTextRange({
            parent: importClause,
            newText: emptyBracesText,
            insertPos: replaceNode.getStart(),
            replacing: {
                textLength: replaceNode.getWidth()
            }
        });
        return;
    }

    const defaultImport = importClause.getDefaultImport();
    if (defaultImport != null) {
        insertIntoParentTextRange({
            insertPos: defaultImport.getEnd(),
            parent: importClause,
            newText: `, ${emptyBracesText}`
        });
        return;
    }
}

function getErrorWhenNamespaceImportsExist() {
    return new errors.InvalidOperationError("Cannot add a named import to an import declaration that has a namespace import.");
}
