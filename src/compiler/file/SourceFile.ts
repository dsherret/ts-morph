import * as ts from "typescript";
import * as errors from "./../../errors";
import {GlobalContainer} from "./../../GlobalContainer";
import {Directory} from "./../../fileSystem";
import {removeChildrenWithFormatting, FormattingKind, replaceSourceFileTextForFormatting} from "./../../manipulation";
import {getPreviousMatchingPos, getNextMatchingPos} from "./../../manipulation/textSeek";
import {Constructor} from "./../../Constructor";
import {ImportDeclarationStructure, ExportDeclarationStructure, ExportAssignmentStructure, SourceFileStructure} from "./../../structures";
import {ImportDeclarationStructureToText, ExportDeclarationStructureToText, ExportAssignmentStructureToText} from "./../../structureToTexts";
import {ArrayUtils, FileUtils, newLineKindToTs, TypeGuards, StringUtils} from "./../../utils";
import {callBaseFill} from "./../callBaseFill";
import {TextInsertableNode} from "./../base";
import {Node, Symbol} from "./../common";
import {StatementedNode} from "./../statement";
import {Diagnostic, EmitResult, EmitOutput, FormatCodeSettings} from "./../tools";
import {ImportDeclaration} from "./ImportDeclaration";
import {ExportDeclaration} from "./ExportDeclaration";
import {ExportAssignment} from "./ExportAssignment";
import {FileSystemRefreshResult} from "./FileSystemRefreshResult";

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
            this.addImportDeclarations(structure.imports);
        if (structure.exports != null)
            this.addExportDeclarations(structure.exports);

        return this;
    }

    /**
     * @internal
     *
     * WARNING: This should only be called by the compiler factory!
     */
    replaceCompilerNodeFromFactory(compilerNode: ts.SourceFile) {
        super.replaceCompilerNodeFromFactory(compilerNode);
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
     * Gets the file path's base name.
     */
    getBaseName() {
        return FileUtils.getBaseName(this.getFilePath());
    }

    /**
     * Gets the directory that the source file is contained in.
     */
    getDirectory(): Directory {
        return this.global.compilerFactory.getDirectory(this.getDirectoryPath())!;
    }

    /**
     * Gets the directory path that the source file is contained in.
     */
    getDirectoryPath() {
        return FileUtils.getDirPath(this.compilerNode.fileName);
    }

    /**
     * Copy this source file to a new file.
     * @param filePath - A new file path. Can be relative to the original file or an absolute path.
     * @param options - Options for copying.
     */
    copy(filePath: string, options: { overwrite?: boolean; } = {}): SourceFile {
        const {overwrite = false} = options;
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(this.global.fileSystem, filePath, this.getDirectoryPath());

        if (overwrite)
            return this.global.compilerFactory.createOrOverwriteSourceFileFromText(absoluteFilePath, this.getFullText());

        try {
            return this.global.compilerFactory.createSourceFileFromText(absoluteFilePath, this.getFullText());
        } catch (err) {
            if (err instanceof errors.InvalidOperationError)
                throw new errors.InvalidOperationError(`Did you mean to provide the overwrite option? ` + err.message);
            else
                throw err;
        }
    }

    /**
     * Asynchronously deletes the file from the file system.
     */
    async delete() {
        const filePath = this.getFilePath();
        this.forget();
        await this.global.fileSystem.delete(filePath);
    }

    /**
     * Synchronously deletes the file from the file system.
     */
    deleteSync() {
        const filePath = this.getFilePath();
        this.forget();
        this.global.fileSystem.deleteSync(filePath);
    }

    /**
     * Asynchronously saves this file with any changes.
     */
    async save() {
        await FileUtils.ensureDirectoryExists(this.global.fileSystem, this.getDirectoryPath());
        await this.global.fileSystem.writeFile(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }

    /**
     * Synchronously saves this file with any changes.
     */
    saveSync() {
        this.global.fileSystem.writeFileSync(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }

    /**
     * Gets any referenced files.
     */
    getReferencedFiles() {
        // todo: add tests
        const dirPath = this.getDirectoryPath();
        return (this.compilerNode.referencedFiles || [])
            .map(f => this.global.compilerFactory.getSourceFileFromFilePath(FileUtils.pathJoin(dirPath, f.fileName)))
            .filter(f => f != null) as SourceFile[];
    }

    /**
     * Gets the source files for any type reference directives.
     */
    getTypeReferenceDirectives() {
        // todo: add tests
        const dirPath = this.getDirectoryPath();
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
    addImportDeclaration(structure: ImportDeclarationStructure) {
        return this.addImportDeclarations([structure])[0];
    }

    /**
     * Add imports.
     * @param structures - Structures that represent the imports.
     */
    addImportDeclarations(structures: ImportDeclarationStructure[]) {
        const imports = this.getImportDeclarations();
        const insertIndex = imports.length === 0 ? 0 : imports[imports.length - 1].getChildIndex() + 1;
        return this.insertImportDeclarations(insertIndex, structures);
    }

    /**
     * Insert an import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the import.
     */
    insertImportDeclaration(index: number, structure: ImportDeclarationStructure) {
        return this.insertImportDeclarations(index, [structure])[0];
    }

    /**
     * Insert imports into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the imports to insert.
     */
    insertImportDeclarations(index: number, structures: ImportDeclarationStructure[]) {
        const texts = structures.map(structure => {
            // todo: pass the StructureToText to the method below
            const writer = this.getWriter();
            const structureToText = new ImportDeclarationStructureToText(writer);
            structureToText.writeText(structure);
            return writer.toString();
        });

        return this._insertMainChildren<ImportDeclaration>(index, texts, structures, ts.SyntaxKind.ImportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(TypeGuards.isImportDeclaration(previousMember)),
            nextBlanklineWhen: nextMember => !(TypeGuards.isImportDeclaration(nextMember)),
            separatorNewlineWhen: () => false
        });
    }

    /**
     * Gets the first import declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImport(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration | undefined {
        return ArrayUtils.find(this.getImportDeclarations(), condition);
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
    getImportDeclarations(): ImportDeclaration[] {
        // todo: remove type assertion
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ImportDeclaration) as ImportDeclaration[];
    }

    /**
     * Add export declarations.
     * @param structure - Structure that represents the export.
     */
    addExportDeclaration(structure: ExportDeclarationStructure) {
        return this.addExportDeclarations([structure])[0];
    }

    /**
     * Add export declarations.
     * @param structures - Structures that represent the exports.
     */
    addExportDeclarations(structures: ExportDeclarationStructure[]) {
        // always insert at end of file because of export {Identifier}; statements
        return this.insertExportDeclarations(this.getChildSyntaxListOrThrow().getChildCount(), structures);
    }

    /**
     * Insert an export declaration.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportDeclaration(index: number, structure: ExportDeclarationStructure) {
        return this.insertExportDeclarations(index, [structure])[0];
    }

    /**
     * Insert export declarations into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportDeclarations(index: number, structures: ExportDeclarationStructure[]) {
        const texts = structures.map(structure => {
            // todo: pass the StructureToText to the method below
            const writer = this.getWriter();
            const structureToText = new ExportDeclarationStructureToText(writer);
            structureToText.writeText(structure);
            return writer.toString();
        });

        return this._insertMainChildren<ExportDeclaration>(index, texts, structures, ts.SyntaxKind.ExportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(TypeGuards.isExportDeclaration(previousMember)),
            nextBlanklineWhen: nextMember => !(TypeGuards.isExportDeclaration(nextMember)),
            separatorNewlineWhen: () => false
        });
    }

    /**
     * Gets the first export declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export declaration by.
     */
    getExportDeclaration(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration | undefined {
        return ArrayUtils.find(this.getExportDeclarations(), condition);
    }

    /**
     * Gets the first export declaration that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the export declaration by.
     */
    getExportDeclarationOrThrow(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration {
        return errors.throwIfNullOrUndefined(this.getExportDeclaration(condition), "Expected to find an export declaration with the provided condition.");
    }

    /**
     * Get the file's export declarations.
     */
    getExportDeclarations(): ExportDeclaration[] {
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ExportDeclaration) as ExportDeclaration[];
    }

    /**
     * Add export assignments.
     * @param structure - Structure that represents the export.
     */
    addExportAssignment(structure: ExportAssignmentStructure) {
        return this.addExportAssignments([structure])[0];
    }

    /**
     * Add export assignments.
     * @param structures - Structures that represent the exports.
     */
    addExportAssignments(structures: ExportAssignmentStructure[]) {
        // always insert at end of file because of export {Identifier}; statements
        return this.insertExportAssignments(this.getChildSyntaxListOrThrow().getChildCount(), structures);
    }

    /**
     * Insert an export assignment.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportAssignment(index: number, structure: ExportAssignmentStructure) {
        return this.insertExportAssignments(index, [structure])[0];
    }

    /**
     * Insert export assignments into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportAssignments(index: number, structures: ExportAssignmentStructure[]) {
        const texts = structures.map(structure => {
            // todo: pass the StructureToText to the method below
            const writer = this.getWriter();
            const structureToText = new ExportAssignmentStructureToText(writer);
            structureToText.writeText(structure);
            return writer.toString();
        });

        return this._insertMainChildren<ExportAssignment>(index, texts, structures, ts.SyntaxKind.ExportAssignment, undefined, {
            previousBlanklineWhen: previousMember => !(TypeGuards.isExportAssignment(previousMember)),
            nextBlanklineWhen: nextMember => !(TypeGuards.isExportAssignment(nextMember)),
            separatorNewlineWhen: () => false
        });
    }

    /**
     * Gets the first export assignment that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export assignment by.
     */
    getExportAssignment(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment | undefined {
        return ArrayUtils.find(this.getExportAssignments(), condition);
    }

    /**
     * Gets the first export assignment that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the export assignment by.
     */
    getExportAssignmentOrThrow(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment {
        return errors.throwIfNullOrUndefined(this.getExportAssignment(condition), "Expected to find an export assignment with the provided condition.");
    }

    /**
     * Get the file's export assignments.
     */
    getExportAssignments(): ExportAssignment[] {
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ExportAssignment) as ExportAssignment[];
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
     * Gets the syntactic, semantic, and declaration diagnostics.
     */
    getDiagnostics(): Diagnostic[] {
        return [
            ...this.global.program.getSyntacticDiagnostics(this),
            ...this.global.program.getSemanticDiagnostics(this),
            ...this.global.program.getDeclarationDiagnostics(this)
        ];
    }

    /**
     * Gets the pre-emit diagnostics.
     */
    getPreEmitDiagnostics(): Diagnostic[] {
        return this.global.program.getPreEmitDiagnostics(this);
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
        const positionRange = typeof positionRangeOrPos === "number" ? [positionRangeOrPos, positionRangeOrPos] as [number, number] : positionRangeOrPos;
        errors.throwIfRangeOutOfRange(positionRange, [0, sourceFileText.length], nameof(positionRange));

        const startLinePos = getPreviousMatchingPos(sourceFileText, positionRange[0], char => char === "\n");
        const endLinePos = getNextMatchingPos(sourceFileText, positionRange[1], char => char === "\r" || char === "\n");
        const indentText = this.global.manipulationSettings.getIndentationText();
        const unindentRegex = times > 0 ? undefined : new RegExp(getDeindentRegexText());

        let pos = startLinePos;
        const newLines: string[] = [];
        for (const line of sourceFileText.substring(startLinePos, endLinePos).split("\n")) {
            if (this.isInStringAtPos(pos))
                newLines.push(line);
            else if (times > 0)
                newLines.push(StringUtils.repeat(indentText, times) + line);
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
     * Gets the emit output of this source file.
     * @param options - Emit options.
     */
    getEmitOutput(options: { emitOnlyDtsFiles?: boolean; } = {}): EmitOutput {
        return this.global.languageService.getEmitOutput(this, options.emitOnlyDtsFiles || false);
    }

    /**
     * Formats the source file text using the internal TypeScript formatting API.
     */
    formatText(settings: FormatCodeSettings = {}) {
        replaceSourceFileTextForFormatting({
            sourceFile: this,
            newText: this.global.languageService.getFormattedDocumentText(this.getFilePath(), settings)
        });
    }

    /**
     * Refresh the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    async refreshFromFileSystem(): Promise<FileSystemRefreshResult> {
        const fileReadResult = await FileUtils.readFileOrNotExists(this.global.fileSystem, this.getFilePath(), this.global.getEncoding());
        return this._refreshFromFileSystemInternal(fileReadResult);
    }

    /**
     * Synchronously refreshes the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    refreshFromFileSystemSync(): FileSystemRefreshResult {
        const fileReadResult = FileUtils.readFileOrNotExistsSync(this.global.fileSystem, this.getFilePath(), this.global.getEncoding());
        return this._refreshFromFileSystemInternal(fileReadResult);
    }

    private _refreshFromFileSystemInternal(fileReadResult: string | false): FileSystemRefreshResult {
        if (fileReadResult === false) {
            this.forget();
            return FileSystemRefreshResult.Deleted;
        }

        const fileText = fileReadResult;
        if (fileText === this.getFullText())
            return FileSystemRefreshResult.NoChange;

        this.replaceText([0, this.getEnd()], fileText);
        return FileSystemRefreshResult.Updated;
    }
}
