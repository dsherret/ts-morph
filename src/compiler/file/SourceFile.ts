import {ts, SyntaxKind, LanguageVariant, ScriptTarget} from "../../typescript";
import * as errors from "../../errors";
import {GlobalContainer} from "../../GlobalContainer";
import {Directory} from "../../fileSystem";
import {removeChildrenWithFormatting, FormattingKind, replaceSourceFileTextForFormatting,
    replaceSourceFileForFilePathMove} from "../../manipulation";
import {getPreviousMatchingPos, getNextMatchingPos} from "../../manipulation/textSeek";
import {Constructor} from "../../Constructor";
import {ImportDeclarationStructure, ExportDeclarationStructure, ExportAssignmentStructure, SourceFileStructure} from "../../structures";
import {ImportDeclarationStructureToText, ExportDeclarationStructureToText, ExportAssignmentStructureToText} from "../../structureToTexts";
import {ArrayUtils, FileUtils, TypeGuards, StringUtils, createHashSet, EventContainer, SourceFileReferenceContainer,
    SourceFileReferencingNodes, ModuleUtils} from "../../utils";
import {callBaseFill} from "../callBaseFill";
import {TextInsertableNode} from "../base";
import {Node, Symbol, Identifier} from "../common";
import {StatementedNode} from "../statement";
import {StringLiteral} from "../literal";
import {Diagnostic, EmitResult, EmitOutput, FormatCodeSettings} from "../tools";
import {ImportDeclaration} from "./ImportDeclaration";
import {ExportDeclaration} from "./ExportDeclaration";
import {ExportAssignment} from "./ExportAssignment";
import {ExportSpecifier} from "./ExportSpecifier";
import {FileSystemRefreshResult} from "./FileSystemRefreshResult";

export interface SourceFileCopyOptions {
    overwrite?: boolean;
}

export interface SourceFileMoveOptions {
    overwrite?: boolean;
}

// todo: not sure why I need to explicitly type this in order to get VS to not complain... (TS 2.4.1)
export const SourceFileBase: Constructor<StatementedNode> & Constructor<TextInsertableNode> & typeof Node = TextInsertableNode(StatementedNode(Node));
export class SourceFile extends SourceFileBase<ts.SourceFile> {
    /** @internal */
    private _isSaved = false;
    /** @internal */
    private readonly _modifiedEventContainer = new EventContainer();
    /** @internal */
    readonly _referenceContainer = new SourceFileReferenceContainer(this);

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
        this._modifiedEventContainer.fire(undefined);
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
        return this.global.compilerFactory.getDirectory(this.getDirectoryPath())!;
    }

    /**
     * Gets the directory path that the source file is contained in.
     */
    getDirectoryPath() {
        return FileUtils.getDirPath(this.compilerNode.fileName);
    }

    /**
     * Gets the line number of the provided position.
     * @param pos - Position
     */
    getLineNumberFromPos(pos: number) {
        return StringUtils.getLineNumberFromPos(this.getFullText(), pos);
    }

    /**
     * Copy this source file to a new file.
     *
     * This will modify the module specifiers in the new file, if necessary.
     * @param filePath - New file path. Can be relative to the original file or an absolute path.
     * @param options - Options for copying.
     */
    copy(filePath: string, options: SourceFileCopyOptions = {}): SourceFile {
        const {overwrite = false} = options;
        filePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());

        if (filePath === this.getFilePath())
            return this;

        const copiedSourceFile = getCopiedSourceFile(this);

        if (copiedSourceFile.getDirectoryPath() !== this.getDirectoryPath())
            updateReferences(this);

        return copiedSourceFile;

        function getCopiedSourceFile(currentFile: SourceFile) {
            try {
                return currentFile.global.compilerFactory.createSourceFileFromText(filePath, currentFile.getFullText(), {
                    overwrite,
                    languageVersion: currentFile.getLanguageVersion()
                });
            } catch (err) {
                if (err instanceof errors.InvalidOperationError)
                    throw new errors.InvalidOperationError(`Did you mean to provide the overwrite option? ` + err.message);
                else
                    throw err;
            }
        }

        function updateReferences(currentFile: SourceFile) {
            const literalReferences = ArrayUtils.from(currentFile._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries());

            // update the nodes in this list to point to the nodes in the copied source file
            for (const reference of literalReferences)
                reference[0] = copiedSourceFile.getChildSyntaxListOrThrow().getDescendantAtStartWithWidth(reference[0].getStart(), reference[0].getWidth())! as StringLiteral;
            // update the string literals in the copied file
            updateStringLiteralReferences(literalReferences);

            // the current files references won't have changed after the modifications
            currentFile.global.lazyReferenceCoordinator.clearDityForSourceFile(currentFile);
        }
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
        const {overwrite = false} = options;
        const oldFilePath = this.getFilePath();
        const oldDirPath = this.getDirectoryPath();
        filePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath, oldDirPath);

        if (filePath === oldFilePath)
            return this;

        const literalReferences = ArrayUtils.from(this._referenceContainer.getLiteralsReferencingOtherSourceFilesEntries());
        const referencingLiterals = ArrayUtils.from(this._referenceContainer.getReferencingLiteralsInOtherSourceFiles());

        if (overwrite) {
            // remove the past file if it exists
            const existingSourceFile = this.global.compilerFactory.getSourceFileFromCacheFromFilePath(filePath);
            if (existingSourceFile != null)
                existingSourceFile.forget();
        }
        else
            this.global.compilerFactory.throwIfFileExists(filePath, "Did you mean to provide the overwrite option?");

        replaceSourceFileForFilePathMove({
            newFilePath: filePath,
            sourceFile: this
        });
        this.global.fileSystemWrapper.queueDelete(oldFilePath);

        updateReferences(this);

        return this;

        function updateReferences(currentSourceFile: SourceFile) {
            // update the literals in this file if the directory hasn't changed
            if (oldDirPath !== currentSourceFile.getDirectoryPath())
                updateStringLiteralReferences(literalReferences);
            // update the string literals in other files
            updateStringLiteralReferences(referencingLiterals.map(node => ([node, currentSourceFile]) as [StringLiteral, SourceFile]));

            // everything should be up to date, so ignore any modifications above
            currentSourceFile.global.lazyReferenceCoordinator.clearDirtySourceFiles();
        }
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
        const newFilePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());
        this.move(filePath, options);
        if (oldFilePath === newFilePath)
            await this.save();
        else
            await Promise.all([this.global.fileSystemWrapper.deleteImmediately(oldFilePath), this.save()]);
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
        const newFilePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath, this.getDirectoryPath());
        this.move(filePath, options);
        if (oldFilePath !== newFilePath)
            this.global.fileSystemWrapper.deleteImmediatelySync(oldFilePath);
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
        this.global.fileSystemWrapper.queueDelete(filePath);
    }

    /**
     * Asynchronously deletes the file from the file system.
     */
    async deleteImmediately() {
        const filePath = this.getFilePath();
        this.forget();
        await this.global.fileSystemWrapper.deleteImmediately(filePath);
    }

    /**
     * Synchronously deletes the file from the file system.
     */
    deleteImmediatelySync() {
        const filePath = this.getFilePath();
        this.forget();
        this.global.fileSystemWrapper.deleteImmediatelySync(filePath);
    }

    /**
     * Asynchronously saves this file with any changes.
     */
    async save() {
        await this.global.fileSystemWrapper.writeFile(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }

    /**
     * Synchronously saves this file with any changes.
     */
    saveSync() {
        this.global.fileSystemWrapper.writeFileSync(this.getFilePath(), this.getFullText());
        this._isSaved = true;
    }

    /**
     * Gets any referenced files.
     */
    getReferencedFiles() {
        // todo: add tests
        const dirPath = this.getDirectoryPath();
        return (this.compilerNode.referencedFiles || [])
            .map(f => this.global.compilerFactory.addOrGetSourceFileFromFilePath(FileUtils.pathJoin(dirPath, f.fileName), {}))
            .filter(f => f != null) as SourceFile[];
    }

    /**
     * Gets the source files for any type reference directives.
     */
    getTypeReferenceDirectives() {
        // todo: add tests
        const dirPath = this.getDirectoryPath();
        return (this.compilerNode.typeReferenceDirectives || [])
            .map(f => this.global.compilerFactory.addOrGetSourceFileFromFilePath(FileUtils.pathJoin(dirPath, f.fileName), {}))
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
        return literals.map(l => this.getNodeFromCompilerNode<StringLiteral>(l));
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

        return this._insertMainChildren<ImportDeclaration>(index, texts, structures, SyntaxKind.ImportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(TypeGuards.isImportDeclaration(previousMember)),
            nextBlanklineWhen: nextMember => !(TypeGuards.isImportDeclaration(nextMember)),
            separatorNewlineWhen: () => false
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

        return this._insertMainChildren<ExportDeclaration>(index, texts, structures, SyntaxKind.ExportDeclaration, undefined, {
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
        return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ExportDeclaration);
    }

    /**
     * Gets the export symbols of the source file.
     */
    getExportSymbols(): Symbol[] {
        return this.global.typeChecker.getExportsOfModule(this.getSymbolOrThrow());
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

        return this._insertMainChildren<ExportAssignment>(index, texts, structures, SyntaxKind.ExportAssignment, undefined, {
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
     * @param settings - Format code settings.
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
        const fileReadResult = await this.global.fileSystemWrapper.readFileOrNotExists(this.getFilePath(), this.global.getEncoding());
        return this._refreshFromFileSystemInternal(fileReadResult);
    }

    /**
     * Synchronously refreshes the source file from the file system.
     *
     * WARNING: When updating from the file system, this will "forget" any previously navigated nodes.
     * @returns What action ended up taking place.
     */
    refreshFromFileSystemSync(): FileSystemRefreshResult {
        const fileReadResult = this.global.fileSystemWrapper.readFileOrNotExistsSync(this.getFilePath(), this.global.getEncoding());
        return this._refreshFromFileSystemInternal(fileReadResult);
    }

    /**
     * Gets the relative path to another source file.
     * @param sourceFile - Source file.
     */
    getRelativePathToSourceFile(sourceFile: SourceFile) {
        return FileUtils.getRelativePathTo(this.getFilePath(), sourceFile.getFilePath());
    }

    /**
     * Gets the relative path to the specified source file as a module specifier.
     * @param sourceFile - Source file.
     */
    getRelativePathToSourceFileAsModuleSpecifier(sourceFile: SourceFile) {
        const sourceFilePath = sourceFile.getFilePath().replace(/\/index(\.d\.ts|\.ts|\.js)$/i, "");
        const moduleSpecifier = FileUtils.getRelativePathTo(this.getFilePath(), sourceFilePath).replace(/((\.d\.ts$)|(\.[^/.]+$))/i, "");
        return StringUtils.startsWith(moduleSpecifier, "../") ? moduleSpecifier : "./" + moduleSpecifier;
    }

    /**
     * Subscribe to when the source file is modified.
     * @param subscription - Subscription.
     * @param subscribe - Optional and defaults to true. Use an explicit false to unsubscribe.
     */
    onModified(subscription: () => void, subscribe = true) {
        if (subscribe)
            this._modifiedEventContainer.subscribe(subscription);
        else
            this._modifiedEventContainer.unsubscribe(subscription);
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
            stringLiteral.setLiteralValue(stringLiteral.sourceFile.getRelativePathToSourceFileAsModuleSpecifier(sourceFile));
    }
}
