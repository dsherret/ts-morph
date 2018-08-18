import { SourceFile, SourceFileCopyOptions, SourceFileMoveOptions } from "../compiler";
import * as errors from "../errors";
import { ProjectContext } from "../ProjectContext";
import { SourceFileCreateOptions } from "../Project";
import { SourceFileStructure } from "../structures";
import { ModuleResolutionKind, ScriptTarget } from "../typescript";
import { ArrayUtils, FileUtils, ObjectUtils, setValueIfUndefined, StringUtils } from "../utils";
import { DirectoryEmitResult } from "./DirectoryEmitResult";

export interface DirectoryAddOptions {
    /**
     * Whether to also recursively add all the directory's descendant directories.
     * @remarks Defaults to false.
     */
    recursive?: boolean;
}

export interface DirectoryMoveOptions extends SourceFileMoveOptions {
}

export interface DirectoryCopyOptions extends SourceFileCopyOptions {
    /**
     * Includes all the files in the directory and sub-directory when copying.
     * @remarks - Defaults to true.
     */
    includeUntrackedFiles?: boolean;
}

export class Directory {
    private _context: ProjectContext | undefined;
    private _path!: string;
    private _pathParts!: string[];

    /** @internal */
    constructor(context: ProjectContext, path: string) {
        this._context = context;
        this._setPathInternal(path);
    }

    /** @internal */
    _setPathInternal(path: string) {
        this._path = path;
        this._pathParts = path.split("/").filter(p => p.length > 0);
    }

    /** @internal */
    get context() {
        this._throwIfDeletedOrRemoved();
        return this._context!;
    }

    /**
     * Checks if this directory is an ancestor of the provided directory.
     * @param possibleDescendant - Directory or source file that's a possible descendant.
     */
    isAncestorOf(possibleDescendant: Directory | SourceFile) {
        return Directory.isAncestorOfDir(this, possibleDescendant);
    }

    /**
     * Checks if this directory is a descendant of the provided directory.
     * @param possibleAncestor - Directory or source file that's a possible ancestor.
     */
    isDescendantOf(possibleAncestor: Directory) {
        return Directory.isAncestorOfDir(possibleAncestor, this);
    }

    /**
     * Gets the directory depth.
     * @internal
     */
    getDepth() {
        return this._pathParts.length;
    }

    /**
     * Gets the path to the directory.
     */
    getPath() {
        this._throwIfDeletedOrRemoved();
        return this._path;
    }

    /**
     * Gets the directory path's base name.
     */
    getBaseName() {
        return this._pathParts[this._pathParts.length - 1];
    }

    /**
     * Gets the parent directory or throws if it doesn't exist or was never added to the AST.
     */
    getParentOrThrow() {
        return errors.throwIfNullOrUndefined(this.getParent(), () => `Parent directory of ${this.getPath()} does not exist or was never added.`);
    }

    /**
     * Gets the parent directory if it exists and was added to the AST.
     */
    getParent() {
        if (FileUtils.isRootDirPath(this.getPath()))
            return undefined;
        return this.addExistingDirectoryIfExists(FileUtils.getDirPath(this.getPath()));
    }

    /**
     * Gets a child directory with the specified path or throws if not found.
     * @param path - Relative path from this directory or absolute path.
     */
    getDirectoryOrThrow(path: string): Directory;
    /**
     * Gets a child directory by the specified condition or throws if not found.
     * @param condition - Condition to check the directory with.
     */
    getDirectoryOrThrow(condition: (directory: Directory) => boolean): Directory;
    getDirectoryOrThrow(pathOrCondition: string | ((directory: Directory) => boolean)) {
        return errors.throwIfNullOrUndefined(this.getDirectory(pathOrCondition), () => {
            if (typeof pathOrCondition === "string")
                return `Could not find a directory at path '${this.context.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath())}'.`;
            return "Could not find child directory that matched condition.";
        });
    }

    /**
     * Gets a directory with the specified path or undefined if not found.
     * @param path - Relative path from this directory or absolute path.
     */
    getDirectory(path: string): Directory | undefined;
    /**
     * Gets a child directory by the specified condition or undefined if not found.
     * @param condition - Condition to check the directory with.
     */
    getDirectory(condition: (directory: Directory) => boolean): Directory | undefined;
    /** @internal */
    getDirectory(pathOrCondition: string | ((directory: Directory) => boolean)): Directory | undefined;
    getDirectory(pathOrCondition: string | ((directory: Directory) => boolean)) {
        if (typeof pathOrCondition === "string") {
            const path = this.context.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath());
            return this.context.compilerFactory.getDirectoryFromCache(path);
        }

        return ArrayUtils.find(this.getDirectories(), pathOrCondition);
    }

    /**
     * Gets a child source file with the specified path or throws if not found.
     * @param path - Relative or absolute path to the file.
     */
    getSourceFileOrThrow(path: string): SourceFile;
    /**
     * Gets a child source file by the specified condition or throws if not found.
     * @param condition - Condition to check the source file with.
     */
    getSourceFileOrThrow(condition: (sourceFile: SourceFile) => boolean): SourceFile;
    /** @internal */
    getSourceFileOrThrow(pathOrCondition: string | ((sourceFile: SourceFile) => boolean)): SourceFile;
    getSourceFileOrThrow(pathOrCondition: string | ((sourceFile: SourceFile) => boolean)) {
        return errors.throwIfNullOrUndefined(this.getSourceFile(pathOrCondition), () => {
            if (typeof pathOrCondition === "string")
                return `Could not find child source file at path '${this.context.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath())}'.`;
            return "Could not find child source file that matched condition.";
        });
    }

    /**
     * Gets a child source file with the specified path or undefined if not found.
     * @param path - Relative or absolute path to the file.
     */
    getSourceFile(path: string): SourceFile | undefined;
    /**
     * Gets a child source file by the specified condition or undefined if not found.
     * @param condition - Condition to check the source file with.
     */
    getSourceFile(condition: (sourceFile: SourceFile) => boolean): SourceFile | undefined;
    /** @internal */
    getSourceFile(pathOrCondition: string | ((sourceFile: SourceFile) => boolean)): SourceFile | undefined;
    getSourceFile(pathOrCondition: string | ((sourceFile: SourceFile) => boolean)) {
        if (typeof pathOrCondition === "string") {
            const path = this.context.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath());
            return this.context.compilerFactory.getSourceFileFromCacheFromFilePath(path);
        }

        return ArrayUtils.find(this.getSourceFiles(), pathOrCondition);
    }

    /**
     * Gets the child directories.
     */
    getDirectories() {
        return this.context.compilerFactory.getChildDirectoriesOfDirectory(this.getPath());
    }

    /**
     * Gets the source files within this directory.
     */
    getSourceFiles() {
        return this.context.compilerFactory.getChildSourceFilesOfDirectory(this.getPath());
    }

    /**
     * Gets the source files in the current directory and all the descendant directories.
     */
    getDescendantSourceFiles() {
        return ArrayUtils.from(this.getDescendantSourceFilesIterator());
    }

    /**
     * Gets the source files in the current directory and all the descendant directories.
     * @internal
     */
    *getDescendantSourceFilesIterator(): IterableIterator<SourceFile> {
        for (const sourceFile of this.getSourceFiles())
            yield sourceFile;
        for (const directory of this.getDirectories())
            yield* directory.getDescendantSourceFilesIterator();
    }

    /**
     * Gets the descendant directories.
     */
    getDescendantDirectories() {
        return ArrayUtils.from(this.getDescendantDirectoriesIterator());
    }

    /**
     * Gets the descendant directories.
     * @internal
     */
    *getDescendantDirectoriesIterator(): IterableIterator<Directory> {
        for (const directory of this.getDirectories()) {
            yield directory;
            yield* directory.getDescendantDirectoriesIterator();
        }
    }

    /**
     * Add source files based on file globs.
     * @param fileGlobs - File glob or globs to add files based on.
     * @returns The matched source files.
     */
    addExistingSourceFiles(fileGlobs: string | string[]): SourceFile[] {
        fileGlobs = typeof fileGlobs === "string" ? [fileGlobs] : fileGlobs;
        fileGlobs = fileGlobs.map(g => {
            if (FileUtils.pathIsAbsolute(g))
                return g;

            return FileUtils.pathJoin(this.getPath(), g);
        });

        return this.context.directoryCoordinator.addExistingSourceFiles(fileGlobs);
    }

    /**
     * Adds an existing directory to the AST from the relative path or directory name, or returns undefined if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Directory name or path to the directory that should be added.
     * @param options - Options.
     * @skipOrThrowCheck
     */
    addExistingDirectoryIfExists(dirPath: string, options: DirectoryAddOptions = {}) {
        dirPath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath, this.getPath());
        return this.context.directoryCoordinator.addExistingDirectoryIfExists(dirPath, options);
    }

    /**
     * Adds an existing directory to the AST from the relative path or directory name, or throws if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param dirPath - Directory name or path to the directory that should be added.
     * @throws DirectoryNotFoundError if the directory does not exist.
     */
    addExistingDirectory(dirPath: string, options: DirectoryAddOptions = {}) {
        dirPath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath, this.getPath());
        return this.context.directoryCoordinator.addExistingDirectory(dirPath, options);
    }

    /**
     * Creates a directory if it doesn't exist.
     * @param dirPath - Relative or absolute path to the directory that should be created.
     */
    createDirectory(dirPath: string) {
        dirPath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath, this.getPath());
        return this.context.directoryCoordinator.createDirectoryOrAddIfExists(dirPath);
    }

    /**
     * Creates a source file in the AST, relative to this directory.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param relativeFilePath - Relative file path of the source file to create.
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(relativeFilePath: string): SourceFile;
    /**
     * Creates a source file in the AST, relative to this directory.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param relativeFilePath - Relative file path of the source file to create.
     * @param sourceFileText - Text of the source file.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(relativeFilePath: string, sourceFileText: string, options?: SourceFileCreateOptions): SourceFile;
    /**
     * Creates a source file in the AST, relative to this directory.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param relativeFilePath - Relative file path of the source file to create.
     * @param structure - Structure that represents the source file.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(relativeFilePath: string, structure: SourceFileStructure, options?: SourceFileCreateOptions): SourceFile;
    createSourceFile(relativeFilePath: string, structureOrText?: string | SourceFileStructure, options?: SourceFileCreateOptions) {
        const filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath());
        return this.context.compilerFactory.createSourceFile(filePath, structureOrText || "", options || {});
    }

    /**
     * Adds an existing source file to the AST, relative to this directory, or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     * @skipOrThrowCheck
     */
    addExistingSourceFileIfExists(relativeFilePath: string): SourceFile | undefined {
        const filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath());
        return this.context.directoryCoordinator.addExistingSourceFileIfExists(filePath);
    }

    /**
     * Adds an existing source file to the AST, relative to this directory, or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     * @throws FileNotFoundError when the file doesn't exist.
     */
    addExistingSourceFile(relativeFilePath: string): SourceFile {
        const filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath());
        return this.context.directoryCoordinator.addExistingSourceFile(filePath);
    }

    /**
     * Emits the files in the directory.
     * @param options - Options for emitting.
     */
    async emit(options: { emitOnlyDtsFiles?: boolean; outDir?: string; declarationDir?: string; } = {}) {
        const {fileSystemWrapper} = this.context;
        const writeTasks: Promise<void>[] = [];
        const outputFilePaths: string[] = [];

        for (const emitResult of this._emitInternal(options)) {
            if (emitResult === false) {
                await Promise.all(writeTasks);
                return new DirectoryEmitResult(true, outputFilePaths);
            }

            writeTasks.push(fileSystemWrapper.writeFile(emitResult.filePath, emitResult.fileText));
            outputFilePaths.push(emitResult.filePath);
        }

        await Promise.all(writeTasks);
        return new DirectoryEmitResult(false, outputFilePaths);
    }

    /**
     * Emits the files in the directory synchronously.
     *
     * Remarks: This might be very slow compared to the asynchronous version if there are a lot of files.
     * @param options - Options for emitting.
     */
    emitSync(options: { emitOnlyDtsFiles?: boolean; outDir?: string; declarationDir?: string; } = {}) {
        const {fileSystemWrapper} = this.context;
        const outputFilePaths: string[] = [];

        for (const emitResult of this._emitInternal(options)) {
            if (emitResult === false)
                return new DirectoryEmitResult(true, outputFilePaths);

            fileSystemWrapper.writeFileSync(emitResult.filePath, emitResult.fileText);
            outputFilePaths.push(emitResult.filePath);
        }

        return new DirectoryEmitResult(false, outputFilePaths);
    }

    private _emitInternal(options: { emitOnlyDtsFiles?: boolean; outDir?: string; declarationDir?: string; } = {})
    {
        const {emitOnlyDtsFiles = false} = options;
        const isJsFile = options.outDir == null ? undefined : /\.js$/i;
        const isMapFile = options.outDir == null ? undefined : /\.js\.map$/i;
        const isDtsFile = options.declarationDir == null && options.outDir == null ? undefined : /\.d\.ts$/i;
        const getStandardizedPath = (path: string | undefined) => path == null ? undefined : this.context.fileSystemWrapper.getStandardizedAbsolutePath(path, this.getPath());
        const getSubDirPath = (path: string | undefined, dir: Directory) => path == null ? undefined : FileUtils.pathJoin(path, dir.getBaseName());
        const hasDeclarationDir = this.context.compilerOptions.get().declarationDir != null || options.declarationDir != null;

        return emitDirectory(this, getStandardizedPath(options.outDir), getStandardizedPath(options.declarationDir));

        function *emitDirectory(directory: Directory, outDir?: string, declarationDir?: string): IterableIterator<false | { filePath: string; fileText: string; }> {
            for (const sourceFile of directory.getSourceFiles()) {
                const output = sourceFile.getEmitOutput({ emitOnlyDtsFiles });
                if (output.getEmitSkipped()) {
                    yield false;
                    return;
                }

                for (const outputFile of output.getOutputFiles()) {
                    let filePath = outputFile.getFilePath();
                    const fileText = outputFile.getWriteByteOrderMark() ? FileUtils.getTextWithByteOrderMark(outputFile.getText()) : outputFile.getText();

                    if (outDir != null && (isJsFile!.test(filePath) || isMapFile!.test(filePath) || (!hasDeclarationDir && isDtsFile!.test(filePath))))
                        filePath = FileUtils.pathJoin(outDir, FileUtils.getBaseName(filePath));
                    else if (declarationDir != null && isDtsFile!.test(filePath))
                        filePath = FileUtils.pathJoin(declarationDir, FileUtils.getBaseName(filePath));

                    yield { filePath, fileText };
                }
            }

            for (const dir of directory.getDirectories())
                yield* emitDirectory(dir, getSubDirPath(outDir, dir), getSubDirPath(declarationDir, dir));
        }
    }

    /**
     * Copies a directory to a new directory.
     * @param relativeOrAbsolutePath - The relative or absolute path to the new directory.
     * @param options - Options.
     * @returns The directory the copy was made to.
     */
    copy(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions) {
        const originalPath = this.getPath();
        const fileSystem = this.context.fileSystemWrapper;
        const newPath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(relativeOrAbsolutePath, this.getPath());

        if (originalPath === newPath)
            return this;

        options = getDirectoryCopyOptions(options);
        if (options.includeUntrackedFiles)
            fileSystem.queueCopyDirectory(originalPath, newPath);

        return this._copyInternal(newPath, options);
    }

    /**
     * Immediately copies the directory to the specified path asynchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     * @remarks If includeTrackedFiles is true, then it will execute the pending operations in the current directory.
     */
    async copyImmediately(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions) {
        const fileSystem = this.context.fileSystemWrapper;
        const originalPath = this.getPath();
        const newPath = fileSystem.getStandardizedAbsolutePath(relativeOrAbsolutePath, originalPath);

        if (originalPath === newPath) {
            await this.save();
            return this;
        }

        options = getDirectoryCopyOptions(options);
        const newDir = this._copyInternal(newPath, options);
        if (options.includeUntrackedFiles)
            await fileSystem.copyDirectoryImmediately(originalPath, newPath);
        await newDir.save();
        return newDir;
    }

    /**
     * Immediately copies the directory to the specified path synchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     * @remarks If includeTrackedFiles is true, then it will execute the pending operations in the current directory.
     */
    copyImmediatelySync(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions) {
        const fileSystem = this.context.fileSystemWrapper;
        const originalPath = this.getPath();
        const newPath = fileSystem.getStandardizedAbsolutePath(relativeOrAbsolutePath, originalPath);

        if (originalPath === newPath) {
            this.saveSync();
            return this;
        }

        options = getDirectoryCopyOptions(options);
        const newDir = this._copyInternal(newPath, options);
        if (options.includeUntrackedFiles)
            fileSystem.copyDirectoryImmediatelySync(originalPath, newPath);
        newDir.saveSync();
        return newDir;
    }

    /** @internal */
    private _copyInternal(newPath: string, options?: DirectoryCopyOptions) {
        const originalPath = this.getPath();

        if (originalPath === newPath)
            return this;

        const fileSystem = this.context.fileSystemWrapper;
        const copyingDirectories = [this, ...this.getDescendantDirectories()].map(directory => ({
            directory,
            oldPath: directory.getPath(),
            newDirPath: directory === this ? newPath : fileSystem.getStandardizedAbsolutePath(this.getRelativePathTo(directory), newPath)
        }));
        const copyingSourceFiles = this.getDescendantSourceFiles().map(sourceFile => ({
            sourceFile,
            newFilePath: fileSystem.getStandardizedAbsolutePath(this.getRelativePathTo(sourceFile), newPath),
            references: this._getReferencesForCopy(sourceFile)
        }));

        // copy directories
        for (const { directory, oldPath, newDirPath } of copyingDirectories)
            this.context.compilerFactory.createDirectoryOrAddIfExists(newDirPath);

        // copy source files
        for (const { sourceFile, newFilePath } of copyingSourceFiles)
            sourceFile._copyInternal(newFilePath, options);

        // update the references
        for (const { references, newFilePath } of copyingSourceFiles)
            this.getSourceFileOrThrow(newFilePath)._updateReferencesForCopyInternal(references);

        return this.context.compilerFactory.getDirectoryFromCache(newPath)!;
    }

    /**
     * Moves the directory to a new path.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     */
    move(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions) {
        const fileSystem = this.context.fileSystemWrapper;
        const originalPath = this.getPath();
        const newPath = fileSystem.getStandardizedAbsolutePath(relativeOrAbsolutePath, originalPath);

        if (originalPath === newPath)
            return this;

        fileSystem.queueMoveDirectory(originalPath, newPath);
        return this._moveInternal(newPath, options);
    }

    /**
     * Immediately moves the directory to a new path asynchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     */
    async moveImmediately(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions) {
        const fileSystem = this.context.fileSystemWrapper;
        const originalPath = this.getPath();
        const newPath = fileSystem.getStandardizedAbsolutePath(relativeOrAbsolutePath, originalPath);

        if (originalPath === newPath) {
            await this.save();
            return this;
        }

        this._moveInternal(newPath, options);
        await fileSystem.moveDirectoryImmediately(originalPath, newPath);
        await this.save();
        return this;
    }

    /**
     * Immediately moves the directory to a new path synchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     */
    moveImmediatelySync(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions) {
        const fileSystem = this.context.fileSystemWrapper;
        const originalPath = this.getPath();
        const newPath = fileSystem.getStandardizedAbsolutePath(relativeOrAbsolutePath, originalPath);

        if (originalPath === newPath) {
            this.saveSync();
            return this;
        }

        this._moveInternal(newPath, options);
        fileSystem.moveDirectoryImmediatelySync(originalPath, newPath);
        this.saveSync();
        return this;
    }

    /** @internal */
    private _moveInternal(newPath: string, options?: DirectoryMoveOptions) {
        const originalPath = this.getPath();

        if (originalPath === newPath)
            return this;

        const fileSystem = this.context.fileSystemWrapper;
        const compilerFactory = this.context.compilerFactory;
        const movingDirectories = [this, ...this.getDescendantDirectories()].map(directory => ({
            directory,
            oldPath: directory.getPath(),
            newDirPath: directory === this ? newPath : fileSystem.getStandardizedAbsolutePath(this.getRelativePathTo(directory), newPath)
        }));
        const movingSourceFiles = this.getDescendantSourceFiles().map(sourceFile => ({
            sourceFile,
            newFilePath: fileSystem.getStandardizedAbsolutePath(this.getRelativePathTo(sourceFile), newPath),
            references: this._getReferencesForMove(sourceFile)
        }));

        // update directories
        for (const { directory, oldPath, newDirPath } of movingDirectories) {
            compilerFactory.removeDirectoryFromCache(oldPath);
            const dirToOverwrite = compilerFactory.getDirectoryFromCache(newDirPath);
            if (dirToOverwrite != null)
                dirToOverwrite._forgetOnlyThis();

            directory._setPathInternal(newDirPath);
            compilerFactory.addDirectoryToCache(directory);
        }

        // update source files
        for (const { sourceFile, newFilePath } of movingSourceFiles)
            sourceFile._moveInternal(newFilePath, options);

        // update the references
        for (const { sourceFile, references } of movingSourceFiles)
            sourceFile._updateReferencesForMoveInternal(references, originalPath);

        return this;
    }

    /**
     * Queues a deletion of the directory to the file system.
     *
     * The directory will be deleted when calling ast.save(). If you wish to delete the file immediately, then use deleteImmediately().
     */
    delete() {
        const {fileSystemWrapper} = this.context;
        const path = this.getPath();
        for (const sourceFile of this.getSourceFiles())
            sourceFile.delete();
        for (const dir of this.getDirectories())
            dir.delete();
        fileSystemWrapper.queueDirectoryDelete(path);
        this.forget();
    }

    /**
     * Asyncronously deletes the directory and all its descendants from the file system.
     */
    async deleteImmediately() {
        const {fileSystemWrapper} = this.context;
        const path = this.getPath();
        this.forget();
        await fileSystemWrapper.deleteDirectoryImmediately(path);
    }

    /**
     * Synchronously deletes the directory and all its descendants from the file system.
     */
    deleteImmediatelySync() {
        const {fileSystemWrapper} = this.context;
        const path = this.getPath();
        this.forget();
        fileSystemWrapper.deleteDirectoryImmediatelySync(path);
    }

    /**
     * Forgets the directory and all its descendants from the Project.
     *
     * Note: Does not delete the directory from the file system.
     */
    forget() {
        if (this.wasForgotten())
            return;

        for (const sourceFile of this.getSourceFiles())
            sourceFile.forget();

        for (const dir of this.getDirectories())
            dir.forget();

        this._forgetOnlyThis();
    }

    /** @internal */
    _forgetOnlyThis() {
        if (this.wasForgotten())
            return;

        this.context.compilerFactory.removeDirectoryFromCache(this.getPath());
        this._context = undefined;
    }

    /**
     * Asynchronously saves the directory and all the unsaved source files to the disk.
     */
    async save() {
        await this.context.fileSystemWrapper.saveForDirectory(this.getPath());
        const unsavedSourceFiles = this.getDescendantSourceFiles().filter(s => !s.isSaved());
        await Promise.all(unsavedSourceFiles.map(s => s.save()));
    }

    /**
     * Synchronously saves the directory and all the unsaved source files to the disk.
     */
    saveSync() {
        this.context.fileSystemWrapper.saveForDirectorySync(this.getPath());
        const unsavedSourceFiles = this.getDescendantSourceFiles().filter(s => !s.isSaved());
        unsavedSourceFiles.forEach(s => s.saveSync());
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
    /** @internal */
    getRelativePathTo(sourceFileOrDir: SourceFile | Directory): string;
    getRelativePathTo(sourceFileOrDir: SourceFile | Directory) {
        return FileUtils.getRelativePathTo(this.getPath(), getPath());

        function getPath() {
            return sourceFileOrDir instanceof SourceFile ? sourceFileOrDir.getFilePath() : sourceFileOrDir.getPath();
        }
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
    /** @internal */
    getRelativePathAsModuleSpecifierTo(sourceFileOrDir: SourceFile | Directory): string;
    getRelativePathAsModuleSpecifierTo(sourceFileOrDir: SourceFile | Directory) {
        const moduleResolution = this.context.program.getEmitModuleResolutionKind();
        const thisDirectory = this;
        const moduleSpecifier = FileUtils.getRelativePathTo(this.getPath(), getPath()).replace(/((\.d\.ts$)|(\.[^/.]+$))/i, "");
        return StringUtils.startsWith(moduleSpecifier, "../") ? moduleSpecifier : "./" + moduleSpecifier;

        function getPath() {
            return sourceFileOrDir instanceof SourceFile ? getPathForSourceFile(sourceFileOrDir) : getPathForDirectory(sourceFileOrDir);

            function getPathForSourceFile(sourceFile: SourceFile) {
                switch (moduleResolution) {
                    case ModuleResolutionKind.NodeJs:
                        const filePath = sourceFile.getFilePath();
                        if (sourceFile.getDirectory() === thisDirectory)
                            return filePath;
                        return filePath.replace(/\/index?(\.d\.ts|\.ts|\.js)$/i, "");
                    case ModuleResolutionKind.Classic:
                        return sourceFile.getFilePath();
                    default:
                        throw errors.getNotImplementedForNeverValueError(moduleResolution);
                }
            }

            function getPathForDirectory(dir: Directory) {
                switch (moduleResolution) {
                    case ModuleResolutionKind.NodeJs:
                        if (dir === thisDirectory)
                            return FileUtils.pathJoin(dir.getPath(), "index.ts");
                        return dir.getPath();
                    case ModuleResolutionKind.Classic:
                        return FileUtils.pathJoin(dir.getPath(), "index.ts");
                    default:
                        throw errors.getNotImplementedForNeverValueError(moduleResolution);
                }
            }
        }
    }

    /**
     * Gets if the directory was forgotten.
     */
    wasForgotten() {
        return this._context == null;
    }

    /** @internal */
    _hasLoadedParent() {
        return this.context.compilerFactory.containsDirectoryAtPath(FileUtils.getDirPath(this.getPath()));
    }

    /** @internal */
    private _throwIfDeletedOrRemoved() {
        if (this.wasForgotten())
            throw new errors.InvalidOperationError("Cannot use a directory that was deleted, removed, or overwritten.");
    }

    /** @internal */
    private _getReferencesForCopy(sourceFile: SourceFile) {
        const literalReferences = sourceFile._getReferencesForCopyInternal();
        return literalReferences.filter(r => !this.isAncestorOf(r[1]));
    }

    /** @internal */
    private _getReferencesForMove(sourceFile: SourceFile) {
        const { literalReferences, referencingLiterals } = sourceFile._getReferencesForMoveInternal();
        return {
            literalReferences: literalReferences.filter(r => !this.isAncestorOf(r[1])),
            referencingLiterals: referencingLiterals.filter(l => !this.isAncestorOf(l.sourceFile))
        };
    }

    /** @internal */
    private static isAncestorOfDir(ancestor: Directory, descendant: Directory | SourceFile) {
        if (descendant instanceof SourceFile) {
            descendant = descendant.getDirectory();
            if (ancestor === descendant)
                return true;
        }

        if (ancestor._pathParts.length >= descendant._pathParts.length)
            return false;

        // more likely to be a mistake at the end, so search backwards
        for (let i = ancestor._pathParts.length - 1; i >= 0; i--) {
            if (ancestor._pathParts[i] !== descendant._pathParts[i])
                return false;
        }

        return true;
    }
}

function getDirectoryCopyOptions(options: DirectoryCopyOptions | undefined) {
    options = ObjectUtils.clone(options || {});
    setValueIfUndefined(options, "includeUntrackedFiles", true);
    return options;
}
