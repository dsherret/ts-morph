import { errors, ArrayUtils, StringUtils, Memoize, EventContainer, FileUtils, LanguageVariant, ScriptTarget, ts, ScriptKind,
    StandardizedFilePath } from "@ts-morph/common";
import { Directory } from "../../../fileSystem";
import { getTextFromTextChanges, insertIntoTextRange, replaceNodeText, replaceSourceFileForFilePathMove,
    replaceSourceFileTextForFormatting } from "../../../manipulation";
import { getNextMatchingPos, getPreviousMatchingPos } from "../../../manipulation/textSeek";
import { ProjectContext } from "../../../ProjectContext";
import { SourceFileSpecificStructure, SourceFileStructure, StructureKind } from "../../../structures";
import { Constructor } from "../../../types";
import { ModuleUtils, SourceFileReferenceContainer, SourceFileReferencingNodes } from "../../../utils";
import { Diagnostic, EmitOptionsBase, EmitOutput, EmitResult, FormatCodeSettings, TextChange, UserPreferences } from "../../tools";
import { ModuledNode, TextInsertableNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node, TextRange } from "../common";
import { StringLiteral } from "../literal";
import { StatementedNode } from "../statement";
import { FileReference, FileSystemRefreshResult } from "./results";

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

// todo: not sure why I need to explicitly type this in order to get TS to not complain... (TS 2.4.1)
export const SourceFileBase: Constructor<ModuledNode> & Constructor<StatementedNode> & Constructor<TextInsertableNode> & typeof Node = ModuledNode(
    TextInsertableNode(StatementedNode(Node))
);
export class SourceFile extends SourceFileBase<ts.SourceFile> {
    /** @internal */
    private _isSaved = false;
    /** @internal */
    private readonly _modifiedEventContainer = new EventContainer<SourceFile>();
    /** @internal */
    private readonly _preModifiedEventContainer = new EventContainer<SourceFile>();
    /** @internal */
    readonly _referenceContainer = new SourceFileReferenceContainer(this);
    /** @internal */
    private _referencedFiles: FileReference[] | undefined;
    /** @internal */
    private _libReferenceDirectives: FileReference[] | undefined;
    /** @internal */
    private _typeReferenceDirectives: FileReference[] | undefined;

    /** @internal */
    _hasBom: true | undefined;

    /**
     * Initializes a new instance.
     * @private
     * @param context - Project context.
     * @param node - Underlying node.
     */
    constructor(
        context: ProjectContext,
        node: ts.SourceFile
    ) {
        super(context, node, undefined);
        // typescript doesn't allow calling `super` with `this`, so set this after
        this.__sourceFile = this;

        // store this before a modification happens to the file
        const onPreModified = () => {
            this.isFromExternalLibrary(); // memoize
            this._preModifiedEventContainer.unsubscribe(onPreModified);
        };
        this._preModifiedEventContainer.subscribe(onPreModified);
    }

    /**
     * @internal
     *
     * WARNING: This should only be called by the compiler factory!
     */
    _replaceCompilerNodeFromFactory(compilerNode: ts.SourceFile) {
        super._replaceCompilerNodeFromFactory(compilerNode);
        this._context.resetProgram(); // make sure the program has the latest source file
        this._isSaved = false;
        this._modifiedEventContainer.fire(this);
    }

    /** @internal */
    protected _clearInternals() {
        super._clearInternals();
        clearTextRanges(this._referencedFiles);
        clearTextRanges(this._typeReferenceDirectives);
        clearTextRanges(this._libReferenceDirectives);
        delete this._referencedFiles;
        delete this._typeReferenceDirectives;
        delete this._libReferenceDirectives;

        function clearTextRanges(textRanges: ReadonlyArray<TextRange> | undefined) {
            textRanges?.forEach(r => r._forget());
        }
    }

    /**
     * Gets the file path.
     */
    getFilePath() {
        return this.compilerNode.fileName as StandardizedFilePath;
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
        return this._context.compilerFactory.getDirectoryFromCache(this.getDirectoryPath())!;
    }

    /**
     * Gets the directory path that the source file is contained in.
     */
    getDirectoryPath(): StandardizedFilePath {
        return this._context.fileSystemWrapper.getStandardizedAbsolutePath(FileUtils.getDirPath(this.compilerNode.fileName));
    }

    /**
     * Gets the full text with leading trivia.
     */
    getFullText() {
        // return the string instead of letting Node.getFullText() do a substring to prevent an extra allocation
        return this.compilerNode.text;
    }

    /**
     * Gets the line and column number at the provided position (1-indexed).
     * @param pos - Position in the source file.
     */
    getLineAndColumnAtPos(pos: number) {
        const fullText = this.getFullText();
        return {
            line: StringUtils.getLineNumberAtPos(fullText, pos),
            column: StringUtils.getLengthFromLineStartAtPos(fullText, pos) + 1
        };
    }

    /**
     * Gets the character count from the start of the line to the provided position.
     * @param pos - Position.
     */
    getLengthFromLineStartAtPos(pos: number) {
        return StringUtils.getLengthFromLineStartAtPos(this.getFullText(), pos);
    }

    /**
     * Copies this source file to the specified directory.
     *
     * This will modify the module specifiers in the new file, if necessary.
     * @param dirPathOrDirectory Directory path or directory object to copy the file to.
     * @param options Options for copying.
     * @returns The source file the copy was made to.
     */
    copyToDirectory(dirPathOrDirectory: string | Directory, options?: SourceFileCopyOptions) {
        const dirPath = typeof dirPathOrDirectory === "string" ? dirPathOrDirectory : dirPathOrDirectory.getPath();
        return this.copy(FileUtils.pathJoin(dirPath, this.getBaseName()), options);
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
    _copyInternal(fileAbsoluteOrRelativePath: string, options: SourceFileCopyOptions = {}) {
        const { overwrite = false } = options;
        const { compilerFactory, fileSystemWrapper } = this._context;
        const standardizedFilePath = fileSystemWrapper.getStandardizedAbsolutePath(fileAbsoluteOrRelativePath, this.getDirectoryPath());

        if (standardizedFilePath === this.getFilePath())
            return false;

        return getCopiedSourceFile(this);

        function getCopiedSourceFile(currentFile: SourceFile) {
            try {
                return compilerFactory.createSourceFileFromText(standardizedFilePath, currentFile.getFullText(),
                    { overwrite, markInProject: getShouldBeInProject() });
            } catch (err) {
                if (err instanceof errors.InvalidOperationError)
                    throw new errors.InvalidOperationError(`Did you mean to provide the overwrite option? ` + err.message);
                else
                    throw err;
            }

            function getShouldBeInProject() {
                if (currentFile._isInProject())
                    return true;
                const destinationFile = compilerFactory.getSourceFileFromCacheFromFilePath(standardizedFilePath);
                return destinationFile != null && destinationFile._isInProject();
            }
        }
    }

    /** @internal */
    _getReferencesForCopyInternal(): [StringLiteral, SourceFile][] {
        return Array.from(this._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries());
    }

    /** @internal */
    _updateReferencesForCopyInternal(literalReferences: ReadonlyArray<[StringLiteral, SourceFile]>) {
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
     * Moves this source file to the specified directory.
     *
     * This will modify the module specifiers in other files that specify this file and the module specifiers in the current file, if necessary.
     * @param dirPathOrDirectory Directory path or directory object to move the file to.
     * @param options Options for moving.
     */
    moveToDirectory(dirPathOrDirectory: string | Directory, options?: SourceFileMoveOptions) {
        const dirPath = typeof dirPathOrDirectory === "string" ? dirPathOrDirectory : dirPathOrDirectory.getPath();
        return this.move(FileUtils.pathJoin(dirPath, this.getBaseName()), options);
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

        this._context.fileSystemWrapper.queueFileDelete(oldFilePath);
        this._updateReferencesForMoveInternal(sourceFileReferences, oldDirPath);

        // ignore any modifications in other source files
        this._context.lazyReferenceCoordinator.clearDirtySourceFiles();
        // need to add the current source file as being dirty because it was removed and added to the cache in the move
        this._context.lazyReferenceCoordinator.addDirtySourceFile(this);

        return this;
    }

    /** @internal */
    _moveInternal(fileRelativeOrAbsolutePath: string, options: SourceFileMoveOptions = {}) {
        const { overwrite = false } = options;
        const filePath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(fileRelativeOrAbsolutePath, this.getDirectoryPath());

        if (filePath === this.getFilePath())
            return false;

        let markAsInProject = false;
        if (overwrite) {
            // remove the past file if it exists
            const existingSourceFile = this._context.compilerFactory.getSourceFileFromCacheFromFilePath(filePath);
            if (existingSourceFile != null) {
                markAsInProject = existingSourceFile._isInProject();
                existingSourceFile.forget();
            }
        }
        else {
            this._context.compilerFactory.throwIfFileExists(filePath, "Did you mean to provide the overwrite option?");
        }

        replaceSourceFileForFilePathMove({
            newFilePath: filePath,
            sourceFile: this
        });

        if (markAsInProject)
            this._markAsInProject();
        if (this._isInProject())
            this.getDirectory()._markAsInProject();

        return true;
    }

    /** @internal */
    _getReferencesForMoveInternal(): SourceFileReferences {
        return {
            literalReferences: Array.from(this._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries()),
            referencingLiterals: Array.from(this._referenceContainer.getReferencingLiteralsInOtherSourceFiles())
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
        const newFilePath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());
        this.move(filePath, options);
        if (oldFilePath !== newFilePath) {
            await this._context.fileSystemWrapper.moveFileImmediately(oldFilePath, newFilePath, this.getFullText());
            this._isSaved = true;
        }
        else {
            await this.save();
        }
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
        const newFilePath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());
        this.move(filePath, options);
        if (oldFilePath !== newFilePath) {
            this._context.fileSystemWrapper.moveFileImmediatelySync(oldFilePath, newFilePath, this.getFullText());
            this._isSaved = true;
        }
        else {
            this.saveSync();
        }
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
        this._context.fileSystemWrapper.queueFileDelete(filePath);
    }

    /**
     * Asynchronously deletes the file from the file system.
     */
    async deleteImmediately() {
        const filePath = this.getFilePath();
        this.forget();
        await this._context.fileSystemWrapper.deleteFileImmediately(filePath);
    }

    /**
     * Synchronously deletes the file from the file system.
     */
    deleteImmediatelySync() {
        const filePath = this.getFilePath();
        this.forget();
        this._context.fileSystemWrapper.deleteFileImmediatelySync(filePath);
    }

    /**
     * Asynchronously saves this file with any changes.
     */
    async save() {
        await this._context.fileSystemWrapper.writeFile(this.getFilePath(), this._getTextForSave());
        this._isSaved = true;
    }

    /**
     * Synchronously saves this file with any changes.
     */
    saveSync() {
        this._context.fileSystemWrapper.writeFileSync(this.getFilePath(), this._getTextForSave());
        this._isSaved = true;
    }

    /** @internal */
    private _getTextForSave() {
        const text = this.getFullText();
        return this._hasBom ? "\uFEFF" + text : text;
    }

    /**
     * Gets any `/// <reference path="..." />` comments.
     */
    getPathReferenceDirectives() {
        if (this._referencedFiles == null) {
            this._referencedFiles = (this.compilerNode.referencedFiles || [])
                .map(f => new FileReference(f, this));
        }
        return this._referencedFiles;
    }

    /**
     * Gets any `/// <reference types="..." />` comments.
     */
    getTypeReferenceDirectives() {
        if (this._typeReferenceDirectives == null) {
            this._typeReferenceDirectives = (this.compilerNode.typeReferenceDirectives || [])
                .map(f => new FileReference(f, this));
        }
        return this._typeReferenceDirectives;
    }

    /**
     * Gets any `/// <reference lib="..." />` comments.
     */
    getLibReferenceDirectives() {
        if (this._libReferenceDirectives == null) {
            this._libReferenceDirectives = (this.compilerNode.libReferenceDirectives || [])
                .map(f => new FileReference(f, this));
        }
        return this._libReferenceDirectives;
    }

    /**
     * Gets any source files that reference this source file.
     */
    getReferencingSourceFiles() {
        return Array.from(this._referenceContainer.getDependentSourceFiles());
    }

    /**
     * Gets the import and exports in other source files that reference this source file.
     */
    getReferencingNodesInOtherSourceFiles() {
        const literals = this.getReferencingLiteralsInOtherSourceFiles();
        return Array.from(getNodes());

        function* getNodes(): Iterable<SourceFileReferencingNodes> {
            for (const literal of literals)
                yield getReferencingNodeFromStringLiteral(literal);
        }
    }

    /**
     * Gets the string literals in other source files that reference this source file.
     */
    getReferencingLiteralsInOtherSourceFiles() {
        return Array.from(this._referenceContainer.getReferencingLiteralsInOtherSourceFiles());
    }

    /**
     * Gets the source files this source file references in string literals.
     */
    getReferencedSourceFiles() {
        const entries = this._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries();
        return Array.from(new Set<SourceFile>(getSourceFilesFromEntries()).values());

        function* getSourceFilesFromEntries(): Iterable<SourceFile> {
            for (const [, sourceFile] of entries)
                yield sourceFile;
        }
    }

    /**
     * Gets the nodes that reference other source files in string literals.
     */
    getNodesReferencingOtherSourceFiles() {
        const entries = this._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries();
        return Array.from(getNodes());

        function* getNodes(): Iterable<SourceFileReferencingNodes> {
            for (const [literal] of entries)
                yield getReferencingNodeFromStringLiteral(literal);
        }
    }

    /**
     * Gets the string literals in this source file that references other source files.
     * @remarks This is similar to `getImportStringLiterals()`, but `getImportStringLiterals()`
     * will return import string literals that may not be referencing another source file
     * or have not been able to be resolved.
     */
    getLiteralsReferencingOtherSourceFiles() {
        const entries = this._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries();
        return Array.from(getLiteralsFromEntries());

        function* getLiteralsFromEntries(): Iterable<StringLiteral> {
            for (const [literal] of entries)
                yield literal;
        }
    }

    /**
     * Gets all the descendant string literals that reference a module.
     */
    getImportStringLiterals() {
        this._ensureBound();
        const literals = ((this.compilerNode as any).imports || []) as ts.StringLiteral[];
        return literals.filter(l => (l.flags & ts.NodeFlags.Synthesized) === 0).map(l => this._getNodeFromCompilerNode(l));
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
     * Gets the script kind of the source file.
     */
    getScriptKind(): ScriptKind {
        // todo: open issue on typescript repo about making this not internal?
        // otherwise, store a collection of what each source file should be.
        return (this.compilerNode as any).scriptKind;
    }

    /**
     * Gets if this is a declaration file.
     */
    isDeclarationFile() {
        return this.compilerNode.isDeclarationFile;
    }

    /**
     * Gets if the source file was discovered while loading an external library.
     */
    @Memoize
    isFromExternalLibrary() {
        // This needs to be memoized and stored before modification because the TypeScript
        // compiler does the following code:
        //
        // function isSourceFileFromExternalLibrary(file: SourceFile): boolean {
        //     return !!sourceFilesFoundSearchingNodeModules.get(file.path);
        // }
        //
        // So the compiler node will become out of date after a manipulation occurs and
        // this will return false.

        // do not create the program if not created before... if the program is
        // not created then we know this source file wasn't discovered by the program
        if (!this._context.program._isCompilerProgramCreated())
            return false;

        const compilerProgram = this._context.program.compilerObject;
        return compilerProgram.isSourceFileFromExternalLibrary(this.compilerNode);
    }

    /**
     * Gets if the source file is a descendant of a node_modules directory.
     */
    isInNodeModules() {
        return this.getFilePath().indexOf("/node_modules/") >= 0;
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
    _setIsSaved(value: boolean) {
        this._isSaved = value;
    }

    /**
     * Gets the pre-emit diagnostics of the specified source file.
     */
    getPreEmitDiagnostics(): Diagnostic[] {
        return this._context.getPreEmitDiagnostics(this);
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

        const correctedText = StringUtils.indent(sourceFileText.substring(startLinePos, endLinePos), times, {
            indentText: this._context.manipulationSettings.getIndentationText(),
            indentSizeInSpaces: this._context.manipulationSettings._getIndentSizeInSpaces(),
            isInStringAtPos: pos => this.isInStringAtPos(pos + startLinePos)
        });

        replaceSourceFileTextForFormatting({
            sourceFile: this,
            newText: sourceFileText.substring(0, startLinePos) + correctedText + sourceFileText.substring(endLinePos)
        });

        return this;
    }

    /**
     * Asynchronously emits the source file as a JavaScript file.
     */
    emit(options?: SourceFileEmitOptions): Promise<EmitResult> {
        return this._context.program.emit({ targetSourceFile: this, ...options });
    }

    /**
     * Synchronously emits the source file as a JavaScript file.
     */
    emitSync(options?: SourceFileEmitOptions): EmitResult {
        return this._context.program.emitSync({ targetSourceFile: this, ...options });
    }

    /**
     * Gets the emit output of this source file.
     * @param options - Emit options.
     */
    getEmitOutput(options: { emitOnlyDtsFiles?: boolean; } = {}): EmitOutput {
        return this._context.languageService.getEmitOutput(this, options.emitOnlyDtsFiles || false);
    }

    /**
     * Formats the source file text using the internal TypeScript formatting API.
     * @param settings - Format code settings.
     */
    formatText(settings: FormatCodeSettings = {}) {
        replaceSourceFileTextForFormatting({
            sourceFile: this,
            newText: this._context.languageService.getFormattedDocumentText(this.getFilePath(), settings)
        });
    }

    /**
     * Refresh the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    async refreshFromFileSystem(): Promise<FileSystemRefreshResult> {
        const fileReadResult = await this._context.fileSystemWrapper.readFileOrNotExists(this.getFilePath(), this._context.getEncoding());
        return this._refreshFromFileSystemInternal(fileReadResult);
    }

    /**
     * Synchronously refreshes the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    refreshFromFileSystemSync(): FileSystemRefreshResult {
        const fileReadResult = this._context.fileSystemWrapper.readFileOrNotExistsSync(this.getFilePath(), this._context.getEncoding());
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
     * Do an action the next time the source file is modified.
     * @param action - Action to run.
     * @internal
     */
    _doActionPreNextModification(action: () => void) {
        const wrappedSubscription = () => {
            action();
            this._preModifiedEventContainer.unsubscribe(wrappedSubscription);
        };
        this._preModifiedEventContainer.subscribe(wrappedSubscription);
        return this;
    }

    /** @internal */
    _firePreModified() {
        this._preModifiedEventContainer.fire(this);
    }

    /**
     * Organizes the imports in the file.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     * @param formatSettings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    organizeImports(formatSettings: FormatCodeSettings = {}, userPreferences: UserPreferences = {}) {
        this._context.languageService.organizeImports(this, formatSettings, userPreferences).forEach(fileTextChanges => fileTextChanges.applyChanges());
        return this;
    }

    /**
     * Removes all unused declarations like interfaces, classes, enums, functions, variables, parameters,
     * methods, properties, imports, etc. from this file.
     *
     * Tip: For optimal results, sometimes this method needs to be called more than once. There could be nodes
     * that are only referenced in unused declarations and in this case, another call will also remove them.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     * @param formatSettings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    fixUnusedIdentifiers(formatSettings: FormatCodeSettings = {}, userPreferences: UserPreferences = {}) {
        this._context.languageService.getCombinedCodeFix(this, "unusedIdentifier_delete", formatSettings, userPreferences).applyChanges();
        return this;
    }

    /**
     * Code fix to add import declarations for identifiers that are referenced, but not imported in the source file.
     * @param formatSettings - Format code settings.
     * @param userPreferences - User preferences for refactoring.
     */
    fixMissingImports(formatSettings: FormatCodeSettings = {}, userPreferences: UserPreferences = {}) {
        const combinedCodeFix = this._context.languageService.getCombinedCodeFix(this, "fixMissingImport", formatSettings, userPreferences);
        const sourceFile = this;

        for (const fileTextChanges of combinedCodeFix.getChanges()) {
            const changes = fileTextChanges.getTextChanges();
            removeUnnecessaryDoubleBlankLines(changes);
            applyTextChanges(changes);
        }

        return this;

        function removeUnnecessaryDoubleBlankLines(changes: TextChange[]) {
            changes.sort((a, b) => a.getSpan().getStart() - b.getSpan().getStart());
            // when a file has no imports, it will add a double newline to every change
            // so remove them except for the last change
            for (let i = 0; i < changes.length - 1; i++) { // skip last change
                const { compilerObject } = changes[i];
                compilerObject.newText = compilerObject.newText.replace(/(\r?)\n\r?\n$/, "$1\n");
            }
        }

        function applyTextChanges(changes: ReadonlyArray<TextChange>) {
            // group all the changes by their start position and insert them into the file
            const groups = ArrayUtils.groupBy(changes, change => change.getSpan().getStart());
            let addedLength = 0;
            for (const group of groups) {
                // these should all be import declarations so it should be safe
                const insertPos = group[0].getSpan().getStart() + addedLength;
                const newText = group.map(item => item.getNewText()).join("");

                insertIntoTextRange({
                    sourceFile,
                    insertPos,
                    newText
                });

                addedLength += newText.length;
            }
        }
    }

    /**
     * Applies the text changes to the source file.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     * @param textChanges - Text changes.
     */
    applyTextChanges(textChanges: ReadonlyArray<ts.TextChange | TextChange>) {
        // do nothing if no changes
        if (textChanges.length === 0)
            return this;

        this.forgetDescendants();
        replaceNodeText({
            sourceFile: this._sourceFile,
            start: 0,
            replacingLength: this.getFullWidth(),
            newText: getTextFromTextChanges(this, textChanges)
        });
        return this;
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<SourceFileStructure>) {
        callBaseSet(SourceFileBase.prototype, this, structure);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): SourceFileStructure {
        return callBaseGetStructure<SourceFileSpecificStructure>(SourceFileBase.prototype, this, {
            kind: StructureKind.SourceFile
        });
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
        this._setIsSaved(true); // saved when loaded from file system
        return FileSystemRefreshResult.Updated;
    }

    /** @internal */
    _isInProject() {
        return this._context.inProjectCoordinator.isSourceFileInProject(this);
    }

    /** @internal */
    _markAsInProject() {
        this._context.inProjectCoordinator.markSourceFileAsInProject(this);
    }
}

function updateStringLiteralReferences(nodeReferences: ReadonlyArray<[StringLiteral, SourceFile]>) {
    for (const [stringLiteral, sourceFile] of nodeReferences) {
        if (ModuleUtils.isModuleSpecifierRelative(stringLiteral.getLiteralText()))
            stringLiteral.setLiteralValue(stringLiteral._sourceFile.getRelativePathAsModuleSpecifierTo(sourceFile));
    }
}

function getReferencingNodeFromStringLiteral(literal: StringLiteral) {
    const parent = literal.getParentOrThrow();
    const grandParent = parent.getParent();
    if (grandParent != null && Node.isImportEqualsDeclaration(grandParent))
        return grandParent;
    else
        return parent as SourceFileReferencingNodes;
}
