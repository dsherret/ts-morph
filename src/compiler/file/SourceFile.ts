import * as ts from "typescript";
import * as errors from "./../../errors";
import {GlobalContainer} from "./../../GlobalContainer";
import {removeChildrenWithFormatting, FormattingKind, replaceSourceFileTextForFormatting} from "./../../manipulation";
import {getPreviousMatchingPos, getNextMatchingPos} from "./../../manipulation/textSeek";
import {Constructor} from "./../../Constructor";
import {ImportDeclarationStructure, ExportDeclarationStructure, SourceFileStructure} from "./../../structures";
import {ArrayUtils, FileUtils, newLineKindToTs, TypeGuards, isStringNode} from "./../../utils";
import {callBaseFill} from "./../callBaseFill";
import {TextInsertableNode} from "./../base";
import {Node, Symbol} from "./../common";
import {StatementedNode} from "./../statement";
import {Diagnostic, EmitResult} from "./../tools";
import {ImportDeclaration} from "./ImportDeclaration";
import {ExportDeclaration} from "./ExportDeclaration";

// todo: not sure why I need to explicitly type this in order to get VS to not complain... (TS 2.4.1)
export const SourceFileBase: Constructor<StatementedNode> & Constructor<TextInsertableNode> & typeof Node = TextInsertableNode(StatementedNode(Node));
export class SourceFile extends SourceFileBase<ts.SourceFile> {
    /** @internal */
    private _isSaved = false;

    /**
     * Initializes a new instance.
     * @internal
     * @param global - Global container.
     * @param node - Underlying node.
     */
    constructor(
        global: GlobalContainer,
        node: ts.SourceFile
    ) {
        // start hack :(
        super(global, node, undefined as any);
        this.sourceFile = this;
        // end hack
    }

    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<SourceFileStructure>) {
        callBaseFill(SourceFileBase.prototype, this, structure);

        if (structure.imports != null)
            this.addImports(structure.imports);
        if (structure.exports != null)
            this.addExports(structure.exports);

        return this;
    }

    /**
     * @internal
     */
    replaceCompilerNode(compilerNode: ts.SourceFile) {
        super.replaceCompilerNode(compilerNode);
        this.global.resetProgram(); // make sure the program has the latest source file
        this._isSaved = false;
    }

    /**
     * Gets the file path.
     */
    getFilePath() {
        return this.compilerNode.fileName;
    }

    /**
     * Copy this source file to a new file.
     * @param filePath - A new file path. Can be relative to the original file or an absolute path.
     */
    copy(filePath: string): SourceFile {
        const absoluteFilePath = FileUtils.getAbsoluteOrRelativePathFromPath(filePath, FileUtils.getDirPath(this.getFilePath()));
        return this.global.compilerFactory.addSourceFileFromText(absoluteFilePath, this.getFullText());
    }

    /**
     * Asynchronously saves this file with any changes.
     */
    async save() {
        await FileUtils.ensureDirectoryExists(this.global.fileSystem, FileUtils.getDirPath(this.getFilePath()));
        await this.global.fileSystem.writeFile(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }

    /**
     * Synchronously saves this file with any changes.
     */
    saveSync() {
        FileUtils.ensureDirectoryExistsSync(this.global.fileSystem, FileUtils.getDirPath(this.getFilePath()));
        this.global.fileSystem.writeFileSync(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }

    /**
     * Gets any referenced files.
     */
    getReferencedFiles() {
        // todo: add tests
        const dirPath = FileUtils.getDirPath(this.getFilePath());
        return (this.compilerNode.referencedFiles || [])
            .map(f => this.global.compilerFactory.getSourceFileFromFilePath(FileUtils.pathJoin(dirPath, f.fileName)))
            .filter(f => f != null) as SourceFile[];
    }

    /**
     * Gets the source files for any type reference directives.
     */
    getTypeReferenceDirectives() {
        // todo: add tests
        const dirPath = FileUtils.getDirPath(this.getFilePath());
        return (this.compilerNode.typeReferenceDirectives || [])
            .map(f => this.global.compilerFactory.getSourceFileFromFilePath(FileUtils.pathJoin(dirPath, f.fileName)))
            .filter(f => f != null) as SourceFile[];
    }

    /**
     * Gets the source file language variant.
     */
    getLanguageVariant() {
        return this.compilerNode.languageVariant;
    }

    /**
     * Gets if this is a declaration file.
     */
    isDeclarationFile() {
        return this.compilerNode.isDeclarationFile;
    }

    /**
     * Gets if this source file has been saved or if the latest changes have been saved.
     */
    isSaved() {
        return this._isSaved;
    }

    /**
     * Sets if this source file has been saved.
     * @internal
     */
    setIsSaved(value: boolean) {
        this._isSaved = value;
    }

    /**
     * Add an import.
     * @param structure - Structure that represents the import.
     */
    addImport(structure: ImportDeclarationStructure) {
        return this.addImports([structure])[0];
    }

    /**
     * Add imports.
     * @param structures - Structures that represent the imports.
     */
    addImports(structures: ImportDeclarationStructure[]) {
        const imports = this.getImports();
        const insertIndex = imports.length === 0 ? 0 : imports[imports.length - 1].getChildIndex() + 1;
        return this.insertImports(insertIndex, structures);
    }

    /**
     * Insert an import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the import.
     */
    insertImport(index: number, structure: ImportDeclarationStructure) {
        return this.insertImports(index, [structure])[0];
    }

    /**
     * Insert imports into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the imports to insert.
     */
    insertImports(index: number, structures: ImportDeclarationStructure[]) {
        const newLineChar = this.global.manipulationSettings.getNewLineKind();
        const indentationText = this.getChildIndentationText();
        const texts = structures.map(structure => {
            const hasNamedImport = structure.namedImports != null && structure.namedImports.length > 0;
            let code = `${indentationText}import`;
            // validation
            if (hasNamedImport && structure.namespaceImport != null)
                throw new errors.InvalidOperationError("An import declaration cannot have both a namespace import and a named import.");
            // default import
            if (structure.defaultImport != null) {
                code += ` ${structure.defaultImport}`;
                if (hasNamedImport || structure.namespaceImport != null)
                    code += ",";
            }
            // namespace import
            if (structure.namespaceImport != null)
                code += ` * as ${structure.namespaceImport}`;
            // named imports
            if (structure.namedImports != null && structure.namedImports.length > 0) {
                const namedImportsCode = structure.namedImports.map(n => {
                    let namedImportCode = n.name;
                    if (n.alias != null)
                        namedImportCode += ` as ${n.alias}`;
                    return namedImportCode;
                }).join(", ");
                code += ` {${namedImportsCode}}`;
            }
            // from keyword
            if (structure.defaultImport != null || hasNamedImport || structure.namespaceImport != null)
                code += " from";
            code += ` "${structure.moduleSpecifier}";`;
            return code;
        });

        return this._insertMainChildren<ImportDeclaration>(index, texts, structures, ts.SyntaxKind.ImportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(previousMember instanceof ImportDeclaration),
            nextBlanklineWhen: nextMember => !(nextMember instanceof ImportDeclaration),
            separatorNewlineWhen: () => false
        });
    }

    /**
     * Gets the first import declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImport(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration | undefined {
        return this.getImports().find(condition);
    }

    /**
     * Gets the first import declaration that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImportOrThrow(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration {
        return errors.throwIfNullOrUndefined(this.getImport(condition), "Expected to find an import with the provided condition.");
    }

    /**
     * Get the file's import declarations.
     */
    getImports(): ImportDeclaration[] {
        // todo: remove type assertion
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ImportDeclaration) as ImportDeclaration[];
    }

    /**
     * Add an export.
     * @param structure - Structure that represents the export.
     */
    addExport(structure: ExportDeclarationStructure) {
        return this.addExports([structure])[0];
    }

    /**
     * Add exports.
     * @param structures - Structures that represent the exports.
     */
    addExports(structures: ExportDeclarationStructure[]) {
        // always insert at end of file because of export {Identifier}; statements
        return this.insertExports(this.getChildSyntaxListOrThrow().getChildCount(), structures);
    }

    /**
     * Insert an export.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExport(index: number, structure: ExportDeclarationStructure) {
        return this.insertExports(index, [structure])[0];
    }

    /**
     * Insert exports into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExports(index: number, structures: ExportDeclarationStructure[]) {
        const newLineChar = this.global.manipulationSettings.getNewLineKind();
        const stringChar = this.global.manipulationSettings.getStringChar();
        const indentationText = this.getChildIndentationText();
        const texts = structures.map(structure => {
            const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
            let code = `${indentationText}export`;
            if (structure.namedExports != null && structure.namedExports.length > 0) {
                const namedExportsCode = structure.namedExports.map(n => {
                    let namedExportCode = n.name;
                    if (n.alias != null)
                        namedExportCode += ` as ${n.alias}`;
                    return namedExportCode;
                }).join(", ");
                code += ` {${namedExportsCode}}`;
            }
            else if (!hasModuleSpecifier)
                code += " {}";
            else
                code += " *";

            if (hasModuleSpecifier)
                code += ` from ${stringChar}${structure.moduleSpecifier}${stringChar}`;

            code += `;`;
            return code;
        });

        return this._insertMainChildren<ImportDeclaration>(index, texts, structures, ts.SyntaxKind.ExportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(previousMember instanceof ExportDeclaration),
            nextBlanklineWhen: nextMember => !(nextMember instanceof ExportDeclaration),
            separatorNewlineWhen: () => false
        });
    }

    /**
     * Gets the first export declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export by.
     */
    getExport(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration | undefined {
        return this.getExports().find(condition);
    }

    /**
     * Gets the first export declaration that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the export by.
     */
    getExportOrThrow(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration {
        return errors.throwIfNullOrUndefined(this.getExport(condition), "Expected to find an export with the provided condition.");
    }

    /**
     * Get the file's export declarations.
     */
    getExports(): ExportDeclaration[] {
        // todo: remove type assertion
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ExportDeclaration) as ExportDeclaration[];
    }

    /**
     * Gets the default export symbol of the file.
     */
    getDefaultExportSymbol(): Symbol | undefined {
        const sourceFileSymbol = this.getSymbol();

        // will be undefined when the source file doesn't have an export
        if (sourceFileSymbol == null)
            return undefined;

        return sourceFileSymbol.getExportByName("default");
    }

    /**
     * Gets the default export symbol of the file or throws if it doesn't exist.
     */
    getDefaultExportSymbolOrThrow(): Symbol {
        return errors.throwIfNullOrUndefined(this.getDefaultExportSymbol(), "Expected to find a default export symbol");
    }

    /**
     * Gets the compiler diagnostics.
     */
    getDiagnostics(): Diagnostic[] {
        // todo: implement cancellation token
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.global.program.compilerObject, this.compilerNode);
        return compilerDiagnostics.map(d => this.global.compilerFactory.getDiagnostic(d));
    }

    /**
     * Removes any "export default";
     */
    removeDefaultExport(defaultExportSymbol?: Symbol | undefined): this {
        defaultExportSymbol = defaultExportSymbol || this.getDefaultExportSymbol();

        if (defaultExportSymbol == null)
            return this;

        const declaration = defaultExportSymbol.getDeclarations()[0];
        if (declaration.compilerNode.kind === ts.SyntaxKind.ExportAssignment)
            removeChildrenWithFormatting({ children: [declaration], getSiblingFormatting: () => FormattingKind.Newline });
        else if (TypeGuards.isModifierableNode(declaration)) {
            declaration.toggleModifier("default", false);
            declaration.toggleModifier("export", false);
        }

        return this;
    }

    /**
     * Deindents the line at the specified position.
     * @param pos - Position.
     * @param times - Times to unindent. Specify a negative value to indent.
     */
    unindent(pos: number, times?: number): this;
    /**
     * Deindents the lines within the specified range.
     * @param positionRange - Position range.
     * @param times - Times to unindent. Specify a negative value to indent.
     */
    unindent(positionRange: [number, number], times?: number): this;
    /**
     * @internal
     */
    unindent(positionRangeOrPos: [number, number] | number, times?: number): this;
    unindent(positionRangeOrPos: [number, number] | number, times = 1) {
        return this.indent(positionRangeOrPos, times * -1);
    }

    /**
     * Indents the line at the specified position.
     * @param pos - Position.
     * @param times - Times to indent. Specify a negative value to unindent.
     */
    indent(pos: number, times?: number): this;
    /**
     * Indents the lines within the specified range.
     * @param positionRange - Position range.
     * @param times - Times to indent. Specify a negative value to unindent.
     */
    indent(positionRange: [number, number], times?: number): this;
    /**
     * @internal
     */
    indent(positionRangeOrPos: [number, number] | number, times?: number): this;
    indent(positionRangeOrPos: [number, number] | number, times = 1) {
        if (times === 0)
            return this;
        const sourceFileText = this.getFullText();
        const positionRange = typeof positionRangeOrPos === "number" ? [positionRangeOrPos, positionRangeOrPos] : positionRangeOrPos;
        const fileRange = [0, sourceFileText.length] as [number, number];
        errors.throwIfOutOfRange(positionRange[0], fileRange, nameof(positionRange));
        errors.throwIfOutOfRange(positionRange[1], fileRange, nameof(positionRange));

        const startLinePos = getPreviousMatchingPos(sourceFileText, positionRange[0], char => char === "\n");
        const endLinePos = getNextMatchingPos(sourceFileText, positionRange[1], char => char === "\r" || char === "\n");
        const stringNodeRanges = this.getDescendants().filter(n => isStringNode(n)).map(n => [n.getStart(), n.getEnd()] as [number, number]);
        const indentText = this.global.manipulationSettings.getIndentationText();
        const unindentRegex = times > 0 ? undefined : new RegExp(getDeindentRegexText());

        let pos = startLinePos;
        const newLines: string[] = [];
        for (const line of sourceFileText.substring(startLinePos, endLinePos).split("\n")) {
            if (stringNodeRanges.some(n => n[0] < pos && n[1] > pos))
                newLines.push(line);
            else if (times > 0)
                newLines.push(indentText.repeat(times) + line);
            else // negative
                newLines.push(line.replace(unindentRegex!, ""));
            pos += line.length;
        }

        replaceSourceFileTextForFormatting({
            sourceFile: this,
            newText: sourceFileText.substring(0, startLinePos) + newLines.join("\n") + sourceFileText.substring(endLinePos)
        });

        return this;

        function getDeindentRegexText() {
            const isSpaces = /^ +$/;
            let text = "^";
            for (let i = 0; i < Math.abs(times); i++) {
                text += "(";
                if (isSpaces.test(indentText)) {
                    // the optional string makes it possible to unindent when a line doesn't have the full number of spaces
                    for (let j = 0; j < indentText.length; j++)
                        text += " ?";
                }
                else
                    text += indentText;

                text += "|\t)?";
            }

            return text;
        }
    }

    /**
     * Emits the source file.
     */
    emit(options?: { emitOnlyDtsFiles?: boolean; }): EmitResult {
        return this.global.program.emit({ targetSourceFile: this, ...options });
    }

    /**
     * Formats the source file text using the internal typescript printer.
     *
     * WARNING: This will dispose any previously navigated descendant nodes.
     */
    formatText(opts: { removeComments?: boolean } = {}) {
        const printer = ts.createPrinter({
            newLine: newLineKindToTs(this.global.manipulationSettings.getNewLineKind()),
            removeComments: opts.removeComments || false
        });
        const newText = printer.printFile(this.compilerNode);
        const replacementSourceFile = this.global.compilerFactory.createTempSourceFileFromText(newText, this.getFilePath());
        this.getChildren().forEach(d => d.dispose()); // this will dispose all the descendants
        this.replaceCompilerNode(replacementSourceFile.compilerNode);
    }
}
