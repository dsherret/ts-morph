import {ts, SyntaxKind} from "./../../typescript";
import * as errors from "./../../errors";
import {ExportSpecifierStructure} from "./../../structures";
import {insertIntoParentTextRange, verifyAndGetIndex, insertIntoCommaSeparatedNodes} from "./../../manipulation";
import {ArrayUtils, TypeGuards, StringUtils} from "./../../utils";
import {Identifier} from "./../common";
import {Statement} from "./../statement";
import {ExportSpecifier} from "./ExportSpecifier";
import {SourceFile} from "./SourceFile";

export class ExportDeclaration extends Statement<ts.ExportDeclaration> {
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
        const stringLiteral = this.getLastChildByKind(SyntaxKind.StringLiteral);

        if (stringLiteral == null) {
            const semiColonToken = this.getLastChildIfKind(SyntaxKind.SemicolonToken);
            const quoteType = this.global.manipulationSettings.getQuoteType();
            insertIntoParentTextRange({
                insertPos: semiColonToken != null ? semiColonToken.getPos() : this.getEnd(),
                parent: this,
                newText: ` from ${quoteType}${text}${quoteType}`
            });
        }
        else {
            insertIntoParentTextRange({
                parent: this,
                newText: text,
                insertPos: stringLiteral.getStart() + 1,
                replacing: {
                    textLength: stringLiteral.getWidth() - 2
                }
            });
        }

        return this;
    }

    /**
     * Gets the module specifier or undefined if it doesn't exist.
     */
    getModuleSpecifier() {
        const moduleSpecifier = this.compilerNode.moduleSpecifier;
        if (moduleSpecifier == null)
            return undefined;
        const text = this.getNodeFromCompilerNode(moduleSpecifier).getText();
        return text.substring(1, text.length - 1);
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
     * Gets if the module specifier starts with `/`, `./`, or `../`.
     */
    isModuleSpecifierRelative() {
        const moduleSpecifier = this.getModuleSpecifier();
        if (moduleSpecifier == null)
            return false;
        return StringUtils.startsWith(moduleSpecifier, "/") ||
            StringUtils.startsWith(moduleSpecifier, "./") ||
            StringUtils.startsWith(moduleSpecifier, "../");
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
            const asteriskToken = this.getFirstChildByKindOrThrow(SyntaxKind.AsteriskToken);
            insertIntoParentTextRange({
                insertPos: asteriskToken.getStart(),
                parent: this,
                newText: `{${codes.join(", ")}}`,
                replacing: {
                    textLength: 1
                }
            });
        }
        else {
            insertIntoCommaSeparatedNodes({
                parent: this.getFirstChildByKindOrThrow(SyntaxKind.NamedExports).getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
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
        const namedExports = this.compilerNode.exportClause;
        if (namedExports == null)
            return [];
        return namedExports.elements.map(e => this.getNodeFromCompilerNode<ExportSpecifier>(e));
    }

    /**
     * Changes the export declaration to namespace export. Removes all the named exports.
     */
    toNamespaceExport(): this {
        if (!this.hasModuleSpecifier())
            throw new errors.InvalidOperationError("Cannot change to a namespace export when no module specifier exists.");

        const namedExportsNode = this.getFirstChildByKind(SyntaxKind.NamedExports);
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
}
