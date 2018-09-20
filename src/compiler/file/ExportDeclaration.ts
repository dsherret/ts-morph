import * as errors from "../../errors";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, verifyAndGetIndex, removeChildren } from "../../manipulation";
import { ExportSpecifierStructure, ExportDeclarationStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, ModuleUtils, TypeGuards, StringUtils } from "../../utils";
import { StringLiteral } from "../literal";
import { Node } from "../common";
import { Statement } from "../statement";
import { ExportSpecifier } from "./ExportSpecifier";
import { SourceFile } from "./SourceFile";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";

export const ExportDeclarationBase = Statement;
export class ExportDeclaration extends ExportDeclarationBase<ts.ExportDeclaration> {
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

        if (StringUtils.isNullOrEmpty(text)) {
            this.removeModuleSpecifier();
            return this;
        }

        const stringLiteral = this.getModuleSpecifier();

        if (stringLiteral == null) {
            const semiColonToken = this.getLastChildIfKind(SyntaxKind.SemicolonToken);
            const quoteKind = this.context.manipulationSettings.getQuoteKind();
            insertIntoParentTextRange({
                insertPos: semiColonToken != null ? semiColonToken.getPos() : this.getEnd(),
                parent: this,
                newText: ` from ${quoteKind}${text}${quoteKind}`
            });
        }
        else
            stringLiteral.setLiteralValue(text);

        return this;
    }

    /**
     * Gets the module specifier or undefined if it doesn't exist.
     */
    getModuleSpecifier(): StringLiteral | undefined {
        const moduleSpecifier = this.getNodeFromCompilerNodeIfExists(this.compilerNode.moduleSpecifier);
        if (moduleSpecifier == null)
            return undefined;
        if (!TypeGuards.isStringLiteral(moduleSpecifier))
            throw new errors.InvalidOperationError("Expected the module specifier to be a string literal.");
        return moduleSpecifier;
    }

    /**
     * Gets the module specifier value or undefined if it doesn't exist.
     */
    getModuleSpecifierValue() {
        const moduleSpecifier = this.getModuleSpecifier();
        return moduleSpecifier == null ? undefined : moduleSpecifier.getLiteralValue();
    }

    /**
     * Gets the source file referenced in the module specifier or throws if it can't find it or it doesn't exist.
     */
    getModuleSpecifierSourceFileOrThrow() {
        return errors.throwIfNullOrUndefined(this.getModuleSpecifierSourceFile(), `A module specifier source file was expected.`);
    }

    /**
     * Gets the source file referenced in the module specifier.
     */
    getModuleSpecifierSourceFile() {
        const stringLiteral = this.getLastChildByKind(SyntaxKind.StringLiteral);
        if (stringLiteral == null)
            return undefined;
        const symbol = stringLiteral.getSymbol();
        if (symbol == null)
            return undefined;
        const declarations = symbol.getDeclarations();
        if (declarations.length === 0 || declarations[0].getKind() !== SyntaxKind.SourceFile)
            return undefined;
        return declarations[0] as SourceFile;
    }

    /**
     * Gets if the module specifier starts with `./` or `../`.
     */
    isModuleSpecifierRelative() {
        const moduleSpecifierValue = this.getModuleSpecifierValue();
        if (moduleSpecifierValue == null)
            return false;
        return ModuleUtils.isModuleSpecifierRelative(moduleSpecifierValue);
    }

    /**
     * Removes the module specifier.
     */
    removeModuleSpecifier() {
        const moduleSpecifier = this.getModuleSpecifier();
        if (moduleSpecifier == null)
            return this;
        if (!this.hasNamedExports())
            throw new errors.InvalidOperationError(`Cannot remove the module specifier from an export declaration that has no named exports.`);

        removeChildren({
            children: [this.getFirstChildByKindOrThrow(SyntaxKind.FromKeyword), moduleSpecifier],
            removePrecedingNewLines: true,
            removePrecedingSpaces: true
        });
        return this;
    }

    /**
     * Gets if the module specifier exists
     */
    hasModuleSpecifier() {
        return this.getLastChildByKind(SyntaxKind.StringLiteral) != null;
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
        return this.compilerNode.exportClause != null;
    }

    /**
     * Adds a named export.
     * @param structure - Structure that represents the named export.
     */
    addNamedExport(structure: ExportSpecifierStructure): ExportSpecifier;
    /**
     * Adds a named export.
     * @param name - Name of the named export.
     */
    addNamedExport(name: string): ExportSpecifier;
    /** @internal */
    addNamedExport(structureOrName: ExportSpecifierStructure | string): ExportSpecifier;
    addNamedExport(structureOrName: ExportSpecifierStructure | string) {
        return this.addNamedExports([structureOrName])[0];
    }

    /**
     * Adds named exports.
     * @param structuresOrNames - Structures or names that represent the named exports.
     */
    addNamedExports(structuresOrNames: ReadonlyArray<ExportSpecifierStructure | string>) {
        return this.insertNamedExports(this.getNamedExports().length, structuresOrNames);
    }

    /**
     * Inserts a named export.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the named export.
     */
    insertNamedExport(index: number, structure: ExportSpecifierStructure): ExportSpecifier;
    /**
     * Inserts a named export.
     * @param index - Child index to insert at.
     * @param name - Name of the named export.
     */
    insertNamedExport(index: number, name: string): ExportSpecifier;
    /** @internal */
    insertNamedExport(index: number, structureOrName: (ExportSpecifierStructure | string)): ExportSpecifier;
    insertNamedExport(index: number, structureOrName: (ExportSpecifierStructure | string)) {
        return this.insertNamedExports(index, [structureOrName])[0];
    }

    /**
     * Inserts named exports into the export declaration.
     * @param index - Child index to insert at.
     * @param structuresOrNames - Structures or names that represent the named exports.
     */
    insertNamedExports(index: number, structuresOrNames: ReadonlyArray<ExportSpecifierStructure | string>) {
        if (ArrayUtils.isNullOrEmpty(structuresOrNames))
                return [];

        const namedExports = this.getNamedExports();
        const writer = this.getWriterWithQueuedChildIndentation();
        const namedExportStructurePrinter = this.context.structurePrinterFactory.forNamedImportExportSpecifier();

        index = verifyAndGetIndex(index, namedExports.length);

        if (this.getNodeProperty("exportClause") == null) {
            namedExportStructurePrinter.printTextsWithBraces(writer, structuresOrNames);
            const asteriskToken = this.getFirstChildByKindOrThrow(SyntaxKind.AsteriskToken);
            insertIntoParentTextRange({
                insertPos: asteriskToken.getStart(),
                parent: this,
                newText: writer.toString(),
                replacing: {
                    textLength: 1
                }
            });
        }
        else {
            namedExportStructurePrinter.printTexts(writer, structuresOrNames);
            insertIntoCommaSeparatedNodes({
                parent: this.getFirstChildByKindOrThrow(SyntaxKind.NamedExports).getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
                currentNodes: namedExports,
                insertIndex: index,
                newText: writer.toString(),
                surroundWithSpaces: this.context.getFormatCodeSettings().insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces
            });
        }

        return getNodesToReturn(this.getNamedExports(), index, structuresOrNames.length);
    }

    /**
     * Gets the named exports.
     */
    getNamedExports(): ExportSpecifier[] {
        const namedExports = this.compilerNode.exportClause;
        if (namedExports == null)
            return [];
        return namedExports.elements.map(e => this.getNodeFromCompilerNode(e));
    }

    /**
     * Changes the export declaration to namespace export. Removes all the named exports.
     */
    toNamespaceExport(): this {
        if (!this.hasModuleSpecifier())
            throw new errors.InvalidOperationError("Cannot change to a namespace export when no module specifier exists.");

        const namedExportsNode = this.getNodeProperty("exportClause");
        if (namedExportsNode == null)
            return this;

        insertIntoParentTextRange({
            parent: this,
            newText: "*",
            insertPos: namedExportsNode.getStart(),
            replacing: {
                textLength: namedExportsNode.getWidth()
            }
        });
        return this;
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ExportDeclarationStructure>) {
        callBaseSet(ExportDeclarationBase.prototype, this, structure);

        if (structure.namedExports != null) {
            setEmptyNamedExport(this);
            this.addNamedExports(structure.namedExports);
        }
        else if (structure.hasOwnProperty(nameof(structure.namedExports)) && structure.moduleSpecifier == null)
            this.toNamespaceExport();

        if (structure.moduleSpecifier != null)
            this.setModuleSpecifier(structure.moduleSpecifier);
        else if (structure.hasOwnProperty(nameof(structure.moduleSpecifier)))
            this.removeModuleSpecifier();

        if (structure.namedExports == null && structure.hasOwnProperty(nameof(structure.namedExports)))
            this.toNamespaceExport();

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ExportDeclarationStructure {
        const moduleSpecifier = this.getModuleSpecifier();
        return callBaseGetStructure<ExportDeclarationStructure>(ExportDeclarationBase.prototype, this, {
            moduleSpecifier: moduleSpecifier ? moduleSpecifier.getText() : undefined,
            namedExports: this.getNamedExports().map(node => node.getStructure())
        });
    }
}

function setEmptyNamedExport(node: ExportDeclaration) {
    const namedExportsNode = node.getNodeProperty("exportClause");
    let replaceNode: Node;

    if (namedExportsNode != null) {
        if (node.getNamedExports().length === 0)
            return;
        replaceNode = namedExportsNode;
    }
    else
        replaceNode = node.getFirstChildByKindOrThrow(SyntaxKind.AsteriskToken);

    insertIntoParentTextRange({
        parent: node,
        newText: "{ }",
        insertPos: replaceNode.getStart(),
        replacing: {
            textLength: replaceNode.getWidth()
        }
    });
}
