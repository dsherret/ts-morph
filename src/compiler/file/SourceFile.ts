import * as errors from "../../errors";
import { Directory } from "../../fileSystem";
import { ProjectContext } from "../../ProjectContext";
import { FormattingKind, getTextFromFormattingEdits, removeChildrenWithFormatting, replaceNodeText, replaceSourceFileForFilePathMove,
    replaceSourceFileTextForFormatting } from "../../manipulation";
import { getNextMatchingPos, getPreviousMatchingPos } from "../../manipulation/textSeek";
import { ExportAssignmentStructure, ExportDeclarationStructure, ImportDeclarationStructure, SourceFileStructure } from "../../structures";
import { Constructor } from "../../types";
import { LanguageVariant, ScriptTarget, SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, createHashSet, EventContainer, FileUtils, ModuleUtils, SourceFileReferenceContainer, StringUtils, TypeGuards } from "../../utils";
import { TextInsertableNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Node, Symbol } from "../common";
import { StringLiteral } from "../literal";
import { StatementedNode } from "../statement";
import { Diagnostic, EmitOptionsBase, EmitOutput, EmitResult, FormatCodeSettings, UserPreferences, TextChange } from "../tools";
import { ExportAssignment } from "./ExportAssignment";
import { ExportDeclaration } from "./ExportDeclaration";
import { ExportSpecifier } from "./ExportSpecifier";
import { FileSystemRefreshResult } from "./FileSystemRefreshResult";
import { ImportDeclaration } from "./ImportDeclaration";

export interface SourceFileCopyOptions {
    overwrite?: boolean;
}

export interface SourceFileMoveOptions {
    overwrite?: boolean;
}

/**
 * Options for emitting a source file.
 */
export interface SourceFileEmitOptions extends EmitOptionsBase {
}

/** @internal */
export interface SourceFileReferences {
    literalReferences: [StringLiteral, SourceFile][];
    referencingLiterals: StringLiteral[];
}

// todo: not sure why I need to explicitly type this in order to get VS to not complain... (TS 2.4.1)
export const SourceFileBase: Constructor<StatementedNode> & Constructor<TextInsertableNode> & typeof Node = TextInsertableNode(StatementedNode(Node));
export class SourceFile extends SourceFileBase<ts.SourceFile> {
    /** @internal */
    private _isSaved = false;
    /** @internal */
    private readonly _modifiedEventContainer = new EventContainer<SourceFile>();
    /** @internal */
    readonly _referenceContainer = new SourceFileReferenceContainer(this);

    /**
     * Initializes a new instance.
     * @internal
     * @param context - Project context.
     * @param node - Underlying node.
     */
    constructor(
        context: ProjectContext,
        node: ts.SourceFile
    ) {
        // start hack :(
        super(context, node, undefined as any);
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
        this.context.resetProgram(); // make sure the program has the latest source file
        this._isSaved = false;
        this._modifiedEventContainer.fire(this);
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
     * Gets the file path's base name without the extension.
     */
    getBaseNameWithoutExtension() {
        const baseName = this.getBaseName();
        const extension = this.getExtension();
        return baseName.substring(0, baseName.length - extension.length);
    }

    /**
     * Gets the file path's extension.
     */
    getExtension() {
        return FileUtils.getExtension(this.getFilePath());
    }

    /**
     * Gets the directory that the source file is contained in.
     */
    getDirectory(): Directory {
        return this.context.compilerFactory.getDirectoryFromCache(this.getDirectoryPath())!;
    }

    /**
     * Gets the directory path that the source file is contained in.
     */
    getDirectoryPath() {
        return FileUtils.getDirPath(this.compilerNode.fileName);
    }

    /**
     * Gets the full text with leading trivia.
     */
    getFullText() {
        // return the string instead of letting Node.getFullText() do a substring to prevent an extra allocation
        return this.compilerNode.text;
    }

    /**
     * Gets the line number at the provided position.
     * @param pos - Position
     */
    getLineNumberAtPos(pos: number) {
        return StringUtils.getLineNumberAtPos(this.getFullText(), pos);
    }

    /**
     * Gets the character count from the start of the line to the provided position.
     * @param pos - Position.
     */
    getLengthFromLineStartAtPos(pos: number) {
        return StringUtils.getLengthFromLineStartAtPos(this.getFullText(), pos);
    }

    /**
     * Copy this source file to a new file.
     *
     * This will modify the module specifiers in the new file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for copying.
     */
    copy(filePath: string, options: SourceFileCopyOptions = {}): SourceFile {
        const result = this._copyInternal(filePath, options);
        if (result === false)
            return this;

        const copiedSourceFile = result;

        if (copiedSourceFile.getDirectoryPath() !== this.getDirectoryPath())
            copiedSourceFile._updateReferencesForCopyInternal(this._getReferencesForCopyInternal());

        return copiedSourceFile;
    }

    /** @internal */
    _copyInternal(filePath: string, options: SourceFileCopyOptions = {}) {
        const { overwrite = false } = options;
        filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());

        if (filePath === this.getFilePath())
            return false;

        return getCopiedSourceFile(this);

        function getCopiedSourceFile(currentFile: SourceFile) {
            try {
                return currentFile.context.compilerFactory.createSourceFileFromText(filePath, currentFile.getFullText(), { overwrite });
            } catch (err) {
                if (err instanceof errors.InvalidOperationError)
                    throw new errors.InvalidOperationError(`Did you mean to provide the overwrite option? ` + err.message);
                else
                    throw err;
            }
        }
    }

    /** @internal */
    _getReferencesForCopyInternal(): [StringLiteral, SourceFile][] {
        return ArrayUtils.from(this._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries());
    }

    /** @internal */
    _updateReferencesForCopyInternal(literalReferences: [StringLiteral, SourceFile][]) {
        // update the nodes in this list to point to the nodes in this copied source file
        for (const reference of literalReferences)
            reference[0] = this.getChildSyntaxListOrThrow().getDescendantAtStartWithWidth(reference[0].getStart(), reference[0].getWidth())! as StringLiteral;
        // update the string literals in the copied file
        updateStringLiteralReferences(literalReferences);
    }

    /**
     * Copy this source file to a new file and immediately saves it to the file system asynchronously.
     *
     * This will modify the module specifiers in the new file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for copying.
     */
    async copyImmediately(filePath: string, options?: SourceFileCopyOptions): Promise<SourceFile> {
        const newSourceFile = this.copy(filePath, options);
        await newSourceFile.save();
        return newSourceFile;
    }

    /**
     * Copy this source file to a new file and immediately saves it to the file system synchronously.
     *
     * This will modify the module specifiers in the new file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for copying.
     */
    copyImmediatelySync(filePath: string, options?: SourceFileCopyOptions): SourceFile {
        const newSourceFile = this.copy(filePath, options);
        newSourceFile.saveSync();
        return newSourceFile;
    }

    /**
     * Moves this source file to a new file.
     *
     * This will modify the module specifiers in other files that specify this file and the module specifiers in the current file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for moving.
     */
    move(filePath: string, options: SourceFileMoveOptions = {}): SourceFile {
        const oldDirPath = this.getDirectoryPath();
        const sourceFileReferences = this._getReferencesForMoveInternal();
        const oldFilePath = this.getFilePath();

        if (!this._moveInternal(filePath, options))
            return this;

        this.context.fileSystemWrapper.queueFileDelete(oldFilePath);
        this._updateReferencesForMoveInternal(sourceFileReferences, oldDirPath);

        // ignore any modifications in other source files
        this.context.lazyReferenceCoordinator.clearDirtySourceFiles();
        // need to add the current source file as being dirty because it was removed and added to the cache in the move
        this.context.lazyReferenceCoordinator.addDirtySourceFile(this);

        return this;
    }

    /** @internal */
    _moveInternal(filePath: string, options: SourceFileMoveOptions = {}) {
        const {overwrite = false} = options;
        filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());

        if (filePath === this.getFilePath())
            return false;

        if (overwrite) {
            // remove the past file if it exists
            const existingSourceFile = this.context.compilerFactory.getSourceFileFromCacheFromFilePath(filePath);
            if (existingSourceFile != null)
                existingSourceFile.forget();
        }
        else
            this.context.compilerFactory.throwIfFileExists(filePath, "Did you mean to provide the overwrite option?");

        replaceSourceFileForFilePathMove({
            newFilePath: filePath,
            sourceFile: this
        });

        return true;
    }

    /** @internal */
    _getReferencesForMoveInternal(): SourceFileReferences {
        return {
            literalReferences: ArrayUtils.from(this._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries()),
            referencingLiterals: ArrayUtils.from(this._referenceContainer.getReferencingLiteralsInOtherSourceFiles())
        };
    }

    /** @internal */
    _updateReferencesForMoveInternal(sourceFileReferences: SourceFileReferences, oldDirPath: string) {
        const { literalReferences, referencingLiterals } = sourceFileReferences;

        // update the literals in this file if the directory has changed
        if (oldDirPath !== this.getDirectoryPath())
            updateStringLiteralReferences(literalReferences);
        // update the string literals in other files
        updateStringLiteralReferences(referencingLiterals.map(node => ([node, this]) as [StringLiteral, SourceFile]));
    }

    /**
     * Moves this source file to a new file and asynchronously updates the file system immediately.
     *
     * This will modify the module specifiers in other files that specify this file and the module specifiers in the current file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for moving.
     */
    async moveImmediately(filePath: string, options?: SourceFileMoveOptions): Promise<SourceFile> {
        const oldFilePath = this.getFilePath();
        const newFilePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());
        this.move(filePath, options);
        if (oldFilePath !== newFilePath) {
            await this.context.fileSystemWrapper.moveFileImmediately(oldFilePath, newFilePath, this.getFullText());
            this._isSaved = true;
        }
        else
            await this.save();
        return this;
    }

    /**
     * Moves this source file to a new file and synchronously updates the file system immediately.
     *
     * This will modify the module specifiers in other files that specify this file and the module specifiers in the current file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for moving.
     */
    moveImmediatelySync(filePath: string, options?: SourceFileMoveOptions): SourceFile {
        const oldFilePath = this.getFilePath();
        const newFilePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());
        this.move(filePath, options);
        if (oldFilePath !== newFilePath) {
            this.context.fileSystemWrapper.moveFileImmediatelySync(oldFilePath, newFilePath, this.getFullText());
            this._isSaved = true;
        }
        else
            this.saveSync();
        return this;
    }

    /**
     * Queues a deletion of the file to the file system.
     *
     * The file will be deleted when you call ast.save(). If you wish to immediately delete the file, then use deleteImmediately().
     */
    delete() {
        const filePath = this.getFilePath();
        this.forget();
        this.context.fileSystemWrapper.queueFileDelete(filePath);
    }

    /**
     * Asynchronously deletes the file from the file system.
     */
    async deleteImmediately() {
        const filePath = this.getFilePath();
        this.forget();
        await this.context.fileSystemWrapper.deleteFileImmediately(filePath);
    }

    /**
     * Synchronously deletes the file from the file system.
     */
    deleteImmediatelySync() {
        const filePath = this.getFilePath();
        this.forget();
        this.context.fileSystemWrapper.deleteFileImmediatelySync(filePath);
    }

    /**
     * Asynchronously saves this file with any changes.
     */
    async save() {
        await this.context.fileSystemWrapper.writeFile(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }

    /**
     * Synchronously saves this file with any changes.
     */
    saveSync() {
        this.context.fileSystemWrapper.writeFileSync(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }

    /**
     * Gets any referenced files.
     */
    getReferencedFiles() {
        // todo: add tests
        const dirPath = this.getDirectoryPath();
        return (this.compilerNode.referencedFiles || [])
            .map(f => this.context.compilerFactory.addOrGetSourceFileFromFilePath(FileUtils.pathJoin(dirPath, f.fileName)))
            .filter(f => f != null) as SourceFile[];
    }

    /**
     * Gets the source files for any type reference directives.
     */
    getTypeReferenceDirectives() {
        // todo: add tests
        const dirPath = this.getDirectoryPath();
        return (this.compilerNode.typeReferenceDirectives || [])
            .map(f => this.context.compilerFactory.addOrGetSourceFileFromFilePath(FileUtils.pathJoin(dirPath, f.fileName)))
            .filter(f => f != null) as SourceFile[];
    }

    /**
     * Get any source files that reference this source file.
     */
    getReferencingSourceFiles() {
        return ArrayUtils.from(this._referenceContainer.getDependentSourceFiles());
    }

    /**
     * Gets the import and exports in other source files that reference this source file.
     */
    getReferencingNodesInOtherSourceFiles() {
        return ArrayUtils.from(this._referenceContainer.getReferencingNodesInOtherSourceFiles());
    }

    /**
     * Gets the string literals in other source files that reference this source file.
     */
    getReferencingLiteralsInOtherSourceFiles() {
        return ArrayUtils.from(this._referenceContainer.getReferencingLiteralsInOtherSourceFiles());
    }

    /**
     * Gets all the descendant string literals that reference a source file.
     */
    getImportStringLiterals() {
        this.ensureBound();
        const literals = ((this.compilerNode as any).imports || []) as ts.StringLiteral[];
        return literals.filter(l => (l.flags & ts.NodeFlags.Synthesized) === 0).map(l => this.getNodeFromCompilerNode(l));
    }

    /**
     * Gets the script target of the source file.
     */
    getLanguageVersion(): ScriptTarget {
        return this.compilerNode.languageVersion;
    }

    /**
     * Gets the language variant of the source file.
     */
    getLanguageVariant(): LanguageVariant {
        return this.compilerNode.languageVariant;
    }

    /**
     * Gets if this is a declaration file.
     */
    isDeclarationFile() {
        return this.compilerNode.isDeclarationFile;
    }

    /**
     * Gets if the source file is from an external library.
     */
    isFromExternalLibrary() {
        return this.context.program.isSourceFileFromExternalLibrary(this);
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
     * Adds an import.
     * @param structure - Structure that represents the import.
     */
    addImportDeclaration(structure: ImportDeclarationStructure) {
        return this.addImportDeclarations([structure])[0];
    }

    /**
     * Adds imports.
     * @param structures - Structures that represent the imports.
     */
    addImportDeclarations(structures: ImportDeclarationStructure[]) {
        const imports = this.getImportDeclarations();
        const insertIndex = imports.length === 0 ? 0 : imports[imports.length - 1].getChildIndex() + 1;
        return this.insertImportDeclarations(insertIndex, structures);
    }

    /**
     * Insert an import.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the import.
     */
    insertImportDeclaration(index: number, structure: ImportDeclarationStructure) {
        return this.insertImportDeclarations(index, [structure])[0];
    }

    /**
     * Insert imports into a file.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the imports to insert.
     */
    insertImportDeclarations(index: number, structures: ImportDeclarationStructure[]): ImportDeclaration[] {
        return this._insertChildren<ImportDeclaration, ImportDeclarationStructure>({
            expectedKind: SyntaxKind.ImportDeclaration,
            index,
            structures,
            write: (writer, info) => {
                this._standardWrite(writer, info, () => {
                    this.context.structurePrinterFactory.forImportDeclaration().printTexts(writer, structures);
                }, {
                    previousNewLine: previousMember => TypeGuards.isImportDeclaration(previousMember),
                    nextNewLine: nextMember => TypeGuards.isImportDeclaration(nextMember)
                });
            }
        });
    }

    /**
     * Gets the first import declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImportDeclaration(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration | undefined {
        return ArrayUtils.find(this.getImportDeclarations(), condition);
    }

    /**
     * Gets the first import declaration that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImportDeclarationOrThrow(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration {
        return errors.throwIfNullOrUndefined(this.getImportDeclaration(condition), "Expected to find an import with the provided condition.");
    }

    /**
     * Get the file's import declarations.
     */
    getImportDeclarations(): ImportDeclaration[] {
        // todo: remove type assertion
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ImportDeclaration);
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
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportDeclaration(index: number, structure: ExportDeclarationStructure) {
        return this.insertExportDeclarations(index, [structure])[0];
    }

    /**
     * Insert export declarations into a file.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportDeclarations(index: number, structures: ExportDeclarationStructure[]): ExportDeclaration[] {
        return this._insertChildren<ExportDeclaration, ExportDeclarationStructure>({
            expectedKind: SyntaxKind.ExportDeclaration,
            index,
            structures,
            write: (writer, info) => {
                this._standardWrite(writer, info, () => {
                    this.context.structurePrinterFactory.forExportDeclaration().printTexts(writer, structures);
                }, {
                    previousNewLine: previousMember => TypeGuards.isExportDeclaration(previousMember),
                    nextNewLine: nextMember => TypeGuards.isExportDeclaration(nextMember)
                });
            }
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
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ExportDeclaration);
    }

    /**
     * Gets the export symbols of the source file.
     */
    getExportSymbols(): Symbol[] {
        return this.context.typeChecker.getExportsOfModule(this.getSymbolOrThrow());
    }

    /**
     * Gets all the declarations exported from the file.
     */
    getExportedDeclarations(): Node[] {
        const exportSymbols = this.getExportSymbols();
        return ArrayUtils.from(getDeclarationsForSymbols());

        function* getDeclarationsForSymbols() {
            const handledDeclarations = createHashSet<Node>();

            for (const symbol of exportSymbols)
                for (const declaration of symbol.getDeclarations())
                    yield* getDeclarationHandlingExportSpecifiers(declaration);

            function* getDeclarationHandlingExportSpecifiers(declaration: Node): IterableIterator<Node> {
                if (handledDeclarations.has(declaration))
                    return;
                handledDeclarations.add(declaration);

                if (declaration.getKind() === SyntaxKind.ExportSpecifier) {
                    for (const d of (declaration as ExportSpecifier).getLocalTargetDeclarations())
                        yield* getDeclarationHandlingExportSpecifiers(d);
                }
                else if (declaration.getKind() === SyntaxKind.ExportAssignment) {
                    const identifier = (declaration as ExportAssignment).getExpression();
                    if (identifier == null || identifier.getKind() !== SyntaxKind.Identifier)
                        return;
                    const symbol = identifier.getSymbol();
                    if (symbol == null)
                        return;
                    for (const d of symbol.getDeclarations())
                        yield* getDeclarationHandlingExportSpecifiers(d);
                }
                else
                    yield declaration;
            }
        }
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
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportAssignment(index: number, structure: ExportAssignmentStructure) {
        return this.insertExportAssignments(index, [structure])[0];
    }

    /**
     * Insert export assignments into a file.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportAssignments(index: number, structures: ExportAssignmentStructure[]): ExportAssignment[] {
        return this._insertChildren<ExportAssignment, ExportAssignmentStructure>({
            expectedKind: SyntaxKind.ExportAssignment,
            index,
            structures,
            write: (writer, info) => {
                this._standardWrite(writer, info, () => {
                    this.context.structurePrinterFactory.forExportAssignment().printTexts(writer, structures);
                }, {
                    previousNewLine: previousMember => TypeGuards.isExportAssignment(previousMember),
                    nextNewLine: nextMember => TypeGuards.isExportAssignment(nextMember)
                });
            }
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
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ExportAssignment);
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
     * Gets the pre-emit diagnostics of the specified source file.
     */
    getPreEmitDiagnostics(): Diagnostic[] {
        return this.context.getPreEmitDiagnostics(this);
    }

    /**
     * Removes any "export default";
     */
    removeDefaultExport(defaultExportSymbol?: Symbol | undefined): this {
        defaultExportSymbol = defaultExportSymbol || this.getDefaultExportSymbol();

        if (defaultExportSymbol == null)
            return this;

        const declaration = defaultExportSymbol.getDeclarations()[0];
        if (declaration.compilerNode.kind === SyntaxKind.ExportAssignment)
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
        const indentText = this.context.manipulationSettings.getIndentationText();
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
    emit(options?: SourceFileEmitOptions): EmitResult {
        return this.context.program.emit({ targetSourceFile: this, ...options });
    }

    /**
     * Gets the emit output of this source file.
     * @param options - Emit options.
     */
    getEmitOutput(options: { emitOnlyDtsFiles?: boolean; } = {}): EmitOutput {
        return this.context.languageService.getEmitOutput(this, options.emitOnlyDtsFiles || false);
    }

    /**
     * Formats the source file text using the internal TypeScript formatting API.
     * @param settings - Format code settings.
     */
    formatText(settings: FormatCodeSettings = {}) {
        replaceSourceFileTextForFormatting({
            sourceFile: this,
            newText: this.context.languageService.getFormattedDocumentText(this.getFilePath(), settings)
        });
    }

    /**
     * Refresh the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    async refreshFromFileSystem(): Promise<FileSystemRefreshResult> {
        const fileReadResult = await this.context.fileSystemWrapper.readFileOrNotExists(this.getFilePath(), this.context.getEncoding());
        return this._refreshFromFileSystemInternal(fileReadResult);
    }

    /**
     * Synchronously refreshes the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    refreshFromFileSystemSync(): FileSystemRefreshResult {
        const fileReadResult = this.context.fileSystemWrapper.readFileOrNotExistsSync(this.getFilePath(), this.context.getEncoding());
        return this._refreshFromFileSystemInternal(fileReadResult);
    }

    /**
     * Gets the relative path to another source file.
     * @param sourceFile - Source file.
     */
    getRelativePathTo(sourceFile: SourceFile): string;
    /**
     * Gets the relative path to another directory.
     * @param directory - Directory.
     */
    getRelativePathTo(directory: Directory): string;
    getRelativePathTo(sourceFileOrDir: SourceFile | Directory) {
        return this.getDirectory().getRelativePathTo(sourceFileOrDir);
    }

    /**
     * Gets the relative path to the specified source file as a module specifier.
     * @param sourceFile - Source file.
     */
    getRelativePathAsModuleSpecifierTo(sourceFile: SourceFile): string;
    /**
     * Gets the relative path to the specified directory as a module specifier.
     * @param directory - Directory.
     */
    getRelativePathAsModuleSpecifierTo(directory: Directory): string;
    getRelativePathAsModuleSpecifierTo(sourceFileOrDir: SourceFile | Directory) {
        return this.getDirectory().getRelativePathAsModuleSpecifierTo(sourceFileOrDir);
    }

    /**
     * Subscribe to when the source file is modified.
     * @param subscription - Subscription.
     * @param subscribe - Optional and defaults to true. Use an explicit false to unsubscribe.
     */
    onModified(subscription: (sender: SourceFile) => void, subscribe = true) {
        if (subscribe)
            this._modifiedEventContainer.subscribe(subscription);
        else
            this._modifiedEventContainer.unsubscribe(subscription);
        return this;
    }

    /**
     * Organizes the imports in the file.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     * @param settings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(settings: FormatCodeSettings = {}, userPreferences: UserPreferences = {}) {
        this.applyTextChanges(ArrayUtils.flatten(this.context.languageService.organizeImports(this, settings, userPreferences).map(r => r.getTextChanges())));
        return this;
    }

    /**
     * Applies the text changes to the source file.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     * @param textChanges - Text changes.
     */
    applyTextChanges(textChanges: TextChange[]) {
        this.getChildSyntaxListOrThrow().forget();
        replaceNodeText({
            sourceFile: this.sourceFile,
            start: 0,
            replacingLength: this.getFullWidth(),
            newText: getTextFromFormattingEdits(this, textChanges)
        });
        return this;
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
        this.setIsSaved(true); // saved when loaded from file system
        return FileSystemRefreshResult.Updated;
    }
}

function updateStringLiteralReferences(nodeReferences: [StringLiteral, SourceFile][]) {
    for (const [stringLiteral, sourceFile] of nodeReferences) {
        if (ModuleUtils.isModuleSpecifierRelative(stringLiteral.getLiteralText()))
            stringLiteral.setLiteralValue(stringLiteral.sourceFile.getRelativePathAsModuleSpecifierTo(sourceFile));
    }
}
