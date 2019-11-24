import { SourceFile, SourceFileCopyOptions, SourceFileMoveOptions } from "../compiler";
import { errors, ObjectUtils, FileUtils, ModuleResolutionKind, StandardizedFilePath } from "@ts-morph/common";
import { ProjectContext } from "../ProjectContext";
import { SourceFileCreateOptions } from "../Project";
import { SourceFileStructure, OptionalKind } from "../structures";
import { WriterFunction } from "../types";
import { setValueIfUndefined } from "../utils";
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
    private __context: ProjectContext | undefined;
    private _path!: StandardizedFilePath;
    private _pathParts!: string[];

    /** @private */
    constructor(context: ProjectContext, path: StandardizedFilePath) {
        this.__context = context;
        this._setPathInternal(path);
    }

    /** @internal */
    _setPathInternal(path: StandardizedFilePath) {
        this._path = path;
        this._pathParts = path.split("/").filter(p => p.length > 0);
    }

    /** @internal */
    get _context() {
        this._throwIfDeletedOrRemoved();
        return this.__context!;
    }

    /**
     * Checks if this directory is an ancestor of the provided directory.
     * @param possibleDescendant - Directory or source file that's a possible descendant.
     */
    isAncestorOf(possibleDescendant: Directory | SourceFile) {
        return Directory._isAncestorOfDir(this, possibleDescendant);
    }

    /**
     * Checks if this directory is a descendant of the provided directory.
     * @param possibleAncestor - Directory or source file that's a possible ancestor.
     */
    isDescendantOf(possibleAncestor: Directory) {
        return Directory._isAncestorOfDir(possibleAncestor, this);
    }

    /**
     * Gets the directory depth.
     * @internal
     */
    _getDepth() {
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
     * Gets the parent directory or throws if it doesn't exist or was never added to the project.
     */
    getParentOrThrow() {
        return errors.throwIfNullOrUndefined(this.getParent(), () => `Parent directory of ${this.getPath()} does not exist or was never added.`);
    }

    /**
     * Gets the parent directory if it exists and was added to the project.
     */
    getParent() {
        if (FileUtils.isRootDirPath(this.getPath()))
            return undefined;
        return this.addDirectoryAtPathIfExists(FileUtils.getDirPath(this.getPath()));
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
                return `Could not find a directory at path '${this._context.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath())}'.`;
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
            const path = this._context.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath());
            return this._context.compilerFactory.getDirectoryFromCache(path);
        }

        return this.getDirectories().find(pathOrCondition);
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
            if (typeof pathOrCondition === "string") {
                const absolutePath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath());
                return `Could not find child source file at path '${absolutePath}'.`;
            }
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
            const path = this._context.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath());
            return this._context.compilerFactory.getSourceFileFromCacheFromFilePath(path);
        }

        for (const sourceFile of this._getSourceFilesIterator()) {
            if (pathOrCondition(sourceFile))
                return sourceFile;
        }

        return undefined;
    }

    /**
     * Gets the child directories.
     */
    getDirectories() {
        return Array.from(this._getDirectoriesIterator());
    }

    /** @internal */
    _getDirectoriesIterator() {
        return this._context.compilerFactory.getChildDirectoriesOfDirectory(this.getPath());
    }

    /**
     * Gets the source files within this directory.
     */
    getSourceFiles() {
        return Array.from(this._getSourceFilesIterator());
    }

    /** @internal */
    _getSourceFilesIterator() {
        return this._context.compilerFactory.getChildSourceFilesOfDirectory(this.getPath());
    }

    /**
     * Gets the source files in the current directory and all the descendant directories.
     */
    getDescendantSourceFiles() {
        return Array.from(this._getDescendantSourceFilesIterator());
    }

    /**
     * Gets the source files in the current directory and all the descendant directories.
     * @internal
     */
    *_getDescendantSourceFilesIterator(): IterableIterator<SourceFile> {
        for (const sourceFile of this._getSourceFilesIterator())
            yield sourceFile;
        for (const directory of this._getDirectoriesIterator())
            yield* directory._getDescendantSourceFilesIterator();
    }

    /**
     * Gets the descendant directories.
     */
    getDescendantDirectories() {
        return Array.from(this._getDescendantDirectoriesIterator());
    }

    /**
     * Gets the descendant directories.
     * @internal
     */
    *_getDescendantDirectoriesIterator(): IterableIterator<Directory> {
        for (const directory of this.getDirectories()) {
            yield directory;
            yield* directory._getDescendantDirectoriesIterator();
        }
    }

    /**
     * @deprecated Use `addSourceFilesAtPaths`.
     */
    addExistingSourceFiles(fileGlobs: string | ReadonlyArray<string>): SourceFile[] {
        return this.addSourceFilesAtPaths(fileGlobs);
    }

    /**
     * Add source files based on file globs.
     * @param fileGlobs - File glob or globs to add files based on.
     * @returns The matched source files.
     */
    addSourceFilesAtPaths(fileGlobs: string | ReadonlyArray<string>): SourceFile[] {
        fileGlobs = typeof fileGlobs === "string" ? [fileGlobs] : fileGlobs;
        fileGlobs = fileGlobs.map(g => {
            if (FileUtils.pathIsAbsolute(g))
                return g;

            return FileUtils.pathJoin(this.getPath(), g);
        });

        return this._context.directoryCoordinator.addSourceFilesAtPaths(fileGlobs, { markInProject: this._isInProject() });
    }

    /** @deprecated Use `addDirectoryAtPathIfExists` */
    addExistingDirectoryIfExists(dirPath: string, options: DirectoryAddOptions = {}) {
        return this.addDirectoryAtPathIfExists(dirPath, options);
    }

    /**
     * Adds an existing directory from the relative path or directory name, or returns undefined if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param relativeOrAbsoluteDirPath - Directory name or path to the directory that should be added.
     * @param options - Options.
     * @skipOrThrowCheck
     */
    addDirectoryAtPathIfExists(relativeOrAbsoluteDirPath: string, options: DirectoryAddOptions = {}) {
        const dirPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(relativeOrAbsoluteDirPath, this.getPath());
        return this._context.directoryCoordinator.addDirectoryAtPathIfExists(
            dirPath,
            { ...options, markInProject: this._isInProject() }
        );
    }

    /**
     * @deprecated Use `addDirectoryAtPath`.
     */
    addExistingDirectory(dirPath: string, options: DirectoryAddOptions = {}) {
        return this.addDirectoryAtPath(dirPath, options);
    }

    /**
     * Adds an existing directory from the relative path or directory name, or throws if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param relativeOrAbsoluteDirPath - Directory name or path to the directory that should be added.
     * @throws DirectoryNotFoundError if the directory does not exist.
     */
    addDirectoryAtPath(relativeOrAbsoluteDirPath: string, options: DirectoryAddOptions = {}) {
        const dirPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(relativeOrAbsoluteDirPath, this.getPath());
        return this._context.directoryCoordinator.addDirectoryAtPath(
            dirPath,
            { ...options, markInProject: this._isInProject() }
        );
    }

    /**
     * Creates a directory if it doesn't exist.
     * @param relativeOrAbsoluteDirPath - Relative or absolute path to the directory that should be created.
     */
    createDirectory(relativeOrAbsoluteDirPath: string) {
        const dirPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(relativeOrAbsoluteDirPath, this.getPath());
        return this._context.directoryCoordinator.createDirectoryOrAddIfExists(dirPath, { markInProject: this._isInProject() });
    }

    /**
     * Creates a source file, relative to this directory.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param relativeFilePath - Relative file path of the source file to create.
     * @param sourceFileText - Text, structure, or writer function to create the source file text with.
     * @param options - Options.
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(
        relativeFilePath: string,
        sourceFileText?: string | OptionalKind<SourceFileStructure> | WriterFunction,
        options?: SourceFileCreateOptions
    ) {
        const filePath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath());
        return this._context.compilerFactory.createSourceFile(filePath, sourceFileText || "", { ...(options || {}), markInProject: this._isInProject() });
    }

    /**
     * @deprecated Use `addSourceFileAtPathIfExists`.
     */
    addExistingSourceFileIfExists(relativeFilePath: string): SourceFile | undefined {
        return this.addSourceFileAtPathIfExists(relativeFilePath);
    }

    /**
     * Adds an existing source file, relative to this directory, or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     * @skipOrThrowCheck
     */
    addSourceFileAtPathIfExists(relativeFilePath: string): SourceFile | undefined {
        const filePath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath());
        return this._context.directoryCoordinator.addSourceFileAtPathIfExists(filePath, { markInProject: this._isInProject() });
    }

    /**
     * @deprecated Use `addSourceFileAtPath`.
     */
    addExistingSourceFile(relativeFilePath: string): SourceFile {
        return this.addSourceFileAtPath(relativeFilePath);
    }

    /**
     * Adds an existing source file, relative to this directory, or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     * @throws FileNotFoundError when the file doesn't exist.
     */
    addSourceFileAtPath(relativeFilePath: string): SourceFile {
        const filePath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath());
        return this._context.directoryCoordinator.addSourceFileAtPath(filePath, { markInProject: this._isInProject() });
    }

    /**
     * Emits the files in the directory.
     * @param options - Options for emitting.
     */
    async emit(options: { emitOnlyDtsFiles?: boolean; outDir?: string; declarationDir?: string; } = {}) {
        const { fileSystemWrapper } = this._context;
        const writeTasks: Promise<void>[] = [];
        const outputFilePaths: StandardizedFilePath[] = [];
        const skippedFilePaths: StandardizedFilePath[] = [];

        for (const emitResult of this._emitInternal(options)) {
            if (isStandardizedFilePath(emitResult))
                skippedFilePaths.push(emitResult);
            else {
                writeTasks.push(fileSystemWrapper.writeFile(emitResult.filePath, emitResult.fileText));
                outputFilePaths.push(emitResult.filePath);
            }
        }

        await Promise.all(writeTasks);
        return new DirectoryEmitResult(skippedFilePaths, outputFilePaths);
    }

    /**
     * Emits the files in the directory synchronously.
     *
     * Remarks: This might be very slow compared to the asynchronous version if there are a lot of files.
     * @param options - Options for emitting.
     */
    emitSync(options: { emitOnlyDtsFiles?: boolean; outDir?: string; declarationDir?: string; } = {}) {
        const { fileSystemWrapper } = this._context;
        const outputFilePaths: StandardizedFilePath[] = [];
        const skippedFilePaths: StandardizedFilePath[] = [];

        for (const emitResult of this._emitInternal(options)) {
            if (isStandardizedFilePath(emitResult))
                skippedFilePaths.push(emitResult);
            else {
                fileSystemWrapper.writeFileSync(emitResult.filePath, emitResult.fileText);
                outputFilePaths.push(emitResult.filePath);
            }
        }

        return new DirectoryEmitResult(skippedFilePaths, outputFilePaths);
    }

    private _emitInternal(options: { emitOnlyDtsFiles?: boolean; outDir?: string; declarationDir?: string; } = {}) {
        const { emitOnlyDtsFiles = false } = options;
        const isJsFile = options.outDir == null ? undefined : /\.js$/i;
        const isMapFile = options.outDir == null ? undefined : /\.js\.map$/i;
        const isDtsFile = options.declarationDir == null && options.outDir == null ? undefined : /\.d\.ts$/i;
        const getStandardizedPath = (path: string | undefined) => path == null
            ? undefined
            : this._context.fileSystemWrapper.getStandardizedAbsolutePath(path, this.getPath());
        const getSubDirPath = (path: StandardizedFilePath | undefined, dir: Directory) => path == null
            ? undefined
            : FileUtils.pathJoin(path, dir.getBaseName());
        const hasDeclarationDir = this._context.compilerOptions.get().declarationDir != null || options.declarationDir != null;

        return emitDirectory(this, getStandardizedPath(options.outDir), getStandardizedPath(options.declarationDir));

        function* emitDirectory(
            directory: Directory,
            outDir?: StandardizedFilePath,
            declarationDir?: StandardizedFilePath
        ): IterableIterator<StandardizedFilePath | { filePath: StandardizedFilePath; fileText: string; }> {
            for (const sourceFile of directory.getSourceFiles()) {
                const output = sourceFile.getEmitOutput({ emitOnlyDtsFiles });

                if (output.getEmitSkipped()) {
                    yield sourceFile.getFilePath();
                    continue;
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
     * Copies the directory to a subdirectory of the specified directory.
     * @param dirPathOrDirectory Directory path or directory object to copy the directory to.
     * @param options Options for copying.
     * @returns The new copied directory.
     */
    copyToDirectory(dirPathOrDirectory: string | Directory, options?: DirectoryCopyOptions) {
        const dirPath = typeof dirPathOrDirectory === "string" ? dirPathOrDirectory : dirPathOrDirectory.getPath();
        return this.copy(FileUtils.pathJoin(dirPath, this.getBaseName()), options);
    }

    /**
     * Copies the directory to a new directory.
     * @param relativeOrAbsolutePath - The relative or absolute path to the new directory.
     * @param options - Options.
     * @returns The directory the copy was made to.
     */
    copy(relativeOrAbsolutePath: string, options?: DirectoryCopyOptions) {
        const originalPath = this.getPath();
        const fileSystem = this._context.fileSystemWrapper;
        const newPath = this._context.fileSystemWrapper.getStandardizedAbsolutePath(relativeOrAbsolutePath, this.getPath());

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
        const fileSystem = this._context.fileSystemWrapper;
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
        const fileSystem = this._context.fileSystemWrapper;
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
    private _copyInternal(newPath: StandardizedFilePath, options?: DirectoryCopyOptions) {
        const originalPath = this.getPath();

        if (originalPath === newPath)
            return this;

        const { fileSystemWrapper: fileSystem, compilerFactory } = this._context;
        const copyingDirectories = [this, ...this.getDescendantDirectories()].map(directory => ({
            newDirPath: directory === this ? newPath : fileSystem.getStandardizedAbsolutePath(this.getRelativePathTo(directory), newPath)
        }));
        const copyingSourceFiles = this.getDescendantSourceFiles().map(sourceFile => ({
            sourceFile,
            newFilePath: fileSystem.getStandardizedAbsolutePath(this.getRelativePathTo(sourceFile), newPath),
            references: this._getReferencesForCopy(sourceFile)
        }));

        // copy directories
        for (const { newDirPath } of copyingDirectories)
            this._context.compilerFactory.createDirectoryOrAddIfExists(newDirPath, { markInProject: this._isInProject() });

        // copy source files
        for (const { sourceFile, newFilePath } of copyingSourceFiles)
            sourceFile._copyInternal(newFilePath, options);

        // update the references
        for (const { references, newFilePath } of copyingSourceFiles)
            this.getSourceFileOrThrow(newFilePath)._updateReferencesForCopyInternal(references);

        return compilerFactory.getDirectoryFromCache(newPath)!;
    }

    /**
     * Moves the directory to a subdirectory of the specified directory.
     * @param dirPathOrDirectory Directory path or directory object to move the directory to.
     * @param options Options for moving.
     */
    moveToDirectory(dirPathOrDirectory: string | Directory, options?: DirectoryMoveOptions) {
        const dirPath = typeof dirPathOrDirectory === "string" ? dirPathOrDirectory : dirPathOrDirectory.getPath();
        return this.move(FileUtils.pathJoin(dirPath, this.getBaseName()), options);
    }

    /**
     * Moves the directory to a new path.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     */
    move(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions) {
        const fileSystem = this._context.fileSystemWrapper;
        const originalPath = this.getPath();
        const newPath = fileSystem.getStandardizedAbsolutePath(relativeOrAbsolutePath, originalPath);

        if (originalPath === newPath)
            return this;

        return this._moveInternal(newPath, options, () => fileSystem.queueMoveDirectory(originalPath, newPath));
    }

    /**
     * Immediately moves the directory to a new path asynchronously.
     * @param relativeOrAbsolutePath - Directory path as an absolute or relative path.
     * @param options - Options for moving the directory.
     */
    async moveImmediately(relativeOrAbsolutePath: string, options?: DirectoryMoveOptions) {
        const fileSystem = this._context.fileSystemWrapper;
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
        const fileSystem = this._context.fileSystemWrapper;
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
    private _moveInternal(newPath: StandardizedFilePath, options: DirectoryMoveOptions | undefined, preAction?: () => void) {
        const originalPath = this.getPath();

        if (originalPath === newPath)
            return this;

        const existingDir = this._context.compilerFactory.getDirectoryFromCacheOnlyIfInCache(newPath);
        const markInProject = existingDir != null && existingDir._isInProject();

        if (preAction)
            preAction();

        const fileSystem = this._context.fileSystemWrapper;
        const compilerFactory = this._context.compilerFactory;
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

        // mark as in the project last to ensure the previous ancestor dirs aren't marked in the project as well
        if (markInProject)
            this._markAsInProject();

        return this;
    }

    /**
     * Recreates the directory.
     * @remarks This will delete all the descendant source files and directories in memory and queue a delete & mkdir to the file system.
     */
    clear() {
        const path = this.getPath();
        this._deleteDescendants();
        this._context.fileSystemWrapper.queueDirectoryDelete(path);
        this._context.fileSystemWrapper.queueMkdir(path);
    }

    /**
     * Asynchronously recreates the directory.
     * @remarks This will delete all the descendant source files and directories in memory and push a delete & mkdir to the file system.
     */
    async clearImmediately() {
        const path = this.getPath();
        this._deleteDescendants();
        await this._context.fileSystemWrapper.clearDirectoryImmediately(path);
    }

    /**
     * Synchronously recreates the directory.
     * @remarks This will delete all the descendant source files and directories in memory and push a delete & mkdir to the file system.
     */
    clearImmediatelySync() {
        const path = this.getPath();
        this._deleteDescendants();
        this._context.fileSystemWrapper.clearDirectoryImmediatelySync(path);
    }

    /**
     * Queues a deletion of the directory to the file system.
     *
     * The directory will be deleted when calling ast.save(). If you wish to delete the file immediately, then use deleteImmediately().
     */
    delete() {
        const path = this.getPath();
        this._deleteDescendants();
        this._context.fileSystemWrapper.queueDirectoryDelete(path);
        this.forget();
    }

    /** @internal */
    private _deleteDescendants() {
        for (const sourceFile of this.getSourceFiles())
            sourceFile.delete();
        for (const dir of this.getDirectories())
            dir.delete();
    }

    /**
     * Asyncronously deletes the directory and all its descendants from the file system.
     */
    async deleteImmediately() {
        const { fileSystemWrapper } = this._context;
        const path = this.getPath();
        this.forget();
        await fileSystemWrapper.deleteDirectoryImmediately(path);
    }

    /**
     * Synchronously deletes the directory and all its descendants from the file system.
     */
    deleteImmediatelySync() {
        const { fileSystemWrapper } = this._context;
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

        this._context.compilerFactory.removeDirectoryFromCache(this.getPath());
        this.__context = undefined;
    }

    /**
     * Asynchronously saves the directory and all the unsaved source files to the disk.
     */
    async save() {
        await this._context.fileSystemWrapper.saveForDirectory(this.getPath());
        const unsavedSourceFiles = this.getDescendantSourceFiles().filter(s => !s.isSaved());
        await Promise.all(unsavedSourceFiles.map(s => s.save()));
    }

    /**
     * Synchronously saves the directory and all the unsaved source files to the disk.
     */
    saveSync() {
        this._context.fileSystemWrapper.saveForDirectorySync(this.getPath());
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
        const moduleResolution = this._context.program.getEmitModuleResolutionKind();
        const thisDirectory = this;
        const moduleSpecifier = FileUtils.getRelativePathTo(this.getPath(), getPath()).replace(/((\.d\.ts$)|(\.[^/.]+$))/i, "");
        return moduleSpecifier.startsWith("../") ? moduleSpecifier : "./" + moduleSpecifier;

        function getPath() {
            return sourceFileOrDir instanceof SourceFile ? getPathForSourceFile(sourceFileOrDir) : getPathForDirectory(sourceFileOrDir);

            function getPathForSourceFile(sourceFile: SourceFile) {
                switch (moduleResolution) {
                    case ModuleResolutionKind.NodeJs:
                        const filePath = sourceFile.getFilePath();
                        if (sourceFile.getDirectory() === thisDirectory)
                            return filePath;
                        return filePath.replace(/\/index?(\.d\.ts|\.ts|\.js)$/i, "") as StandardizedFilePath;
                    case ModuleResolutionKind.Classic:
                        return sourceFile.getFilePath();
                    default:
                        return errors.throwNotImplementedForNeverValueError(moduleResolution);
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
                        return errors.throwNotImplementedForNeverValueError(moduleResolution);
                }
            }
        }
    }

    /**
     * Gets if the directory was forgotten.
     */
    wasForgotten() {
        return this.__context == null;
    }

    /** @internal */
    _isInProject() {
        return this._context.inProjectCoordinator.isDirectoryInProject(this);
    }

    /** @internal */
    _markAsInProject() {
        this._context.inProjectCoordinator.markDirectoryAsInProject(this);
    }

    /** @internal */
    _hasLoadedParent() {
        return this._context.compilerFactory.containsDirectoryAtPath(FileUtils.getDirPath(this.getPath()));
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
            referencingLiterals: referencingLiterals.filter(l => !this.isAncestorOf(l._sourceFile))
        };
    }

    /** @internal */
    private static _isAncestorOfDir(ancestor: Directory, descendant: Directory | SourceFile) {
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

// workaround for type checker not being able to inline this
function isStandardizedFilePath(filePath: any): filePath is StandardizedFilePath {
    return typeof filePath === "string";
}
