import {SourceFile, OutputFile} from "../compiler";
import * as errors from "../errors";
import {ArrayUtils, FileUtils} from "../utils";
import {SourceFileStructure} from "../structures";
import {GlobalContainer} from "../GlobalContainer";
import {DirectoryEmitResult} from "./DirectoryEmitResult";

export class Directory {
    private _global: GlobalContainer | undefined;
    private readonly _pathParts: string[];
    private _parent: Directory | undefined;
    private _directories: Directory[] = [];
    private _sourceFiles: SourceFile[] = [];

    /** @internal */
    constructor(global: GlobalContainer, private readonly _path: string) {
        this._global = global;
        this._pathParts = this._path.split("/").filter(p => p.length > 0);
    }

    /** @internal */
    private get global() {
        this.throwIfDeletedOrRemoved();
        return this._global!;
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
        this.throwIfDeletedOrRemoved();
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
        this.throwIfDeletedOrRemoved();
        return this._parent;
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
                return `Could not find a directory at path '${this.global.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath())}'.`;
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
            const path = this.global.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath());
            return this.global.compilerFactory.getDirectory(path);
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
                return `Could not find child source file at path '${this.global.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath())}'.`;
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
            const path = this.global.fileSystemWrapper.getStandardizedAbsolutePath(pathOrCondition, this.getPath());
            return this.global.compilerFactory.getSourceFileFromCacheFromFilePath(path);
        }

        return ArrayUtils.find(this.getSourceFiles(), pathOrCondition);
    }

    /**
     * Gets the child directories.
     */
    getDirectories() {
        this.throwIfDeletedOrRemoved();
        return [...this._directories];
    }

    /**
     * Gets the source files within this directory.
     */
    getSourceFiles() {
        this.throwIfDeletedOrRemoved();
        return [...this._sourceFiles];
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
        this.throwIfDeletedOrRemoved();
        for (const sourceFile of this._sourceFiles)
            yield sourceFile;
        for (const directory of this._directories)
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
        this.throwIfDeletedOrRemoved();
        for (const directory of this._directories) {
            yield directory;
            yield* directory.getDescendantDirectoriesIterator();
        }
    }

    /**
     * Adds an existing directory to the AST from the relative path or directory name, or returns undefined if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param path - Directory name or path to the directory that should be added.
     */
    addDirectoryIfExists(path: string) {
        const dirPath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(path, this.getPath());
        return this.global.compilerFactory.getDirectoryFromPath(dirPath);
    }

    /**
     * Adds an existing directory to the AST from the relative path or directory name, or throws if it doesn't exist.
     *
     * Will return the directory if it was already added.
     * @param path - Directory name or path to the directory that should be added.
     * @throws DirectoryNotFoundError if the directory does not exist.
     */
    addExistingDirectory(path: string) {
        const dirPath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(path, this.getPath());
        const directory = this.addDirectoryIfExists(dirPath);
        if (directory == null)
            throw new errors.DirectoryNotFoundError(dirPath);
        return directory;
    }

    /**
     * Creates a directory if it doesn't exist.
     * @param path - Relative or absolute path to the directory that should be created.
     */
    createDirectory(path: string) {
        const dirPath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(path, this.getPath());
        return this.global.compilerFactory.createDirectory(dirPath);
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
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(relativeFilePath: string, sourceFileText: string): SourceFile;
    /**
     * Creates a source file in the AST, relative to this directory.
     *
     * Note: The file will not be created and saved to the file system until .save() is called on the source file.
     * @param relativeFilePath - Relative file path of the source file to create.
     * @param structure - Structure that represents the source file.
     * @throws - InvalidOperationError if a source file already exists at the provided file name.
     */
    createSourceFile(relativeFilePath: string, structure: SourceFileStructure): SourceFile;
    createSourceFile(relativeFilePath: string, structureOrText?: string | SourceFileStructure) {
        const filePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath());
        return this.global.compilerFactory.createSourceFile(filePath, structureOrText);
    }

    /**
     * Adds an existing source file to the AST, relative to this directory, or returns undefined.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     */
    addSourceFileIfExists(relativeFilePath: string): SourceFile | undefined {
        const filePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath());
        return this.global.compilerFactory.addOrGetSourceFileFromFilePath(filePath);
    }

    /**
     * Adds an existing source file to the AST, relative to this directory, or throws if it doesn't exist.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     * @throws FileNotFoundError when the file doesn't exist.
     */
    addExistingSourceFile(relativeFilePath: string): SourceFile {
        const sourceFile = this.addSourceFileIfExists(relativeFilePath);
        if (sourceFile == null)
            throw new errors.FileNotFoundError(this.global.fileSystemWrapper.getStandardizedAbsolutePath(relativeFilePath, this.getPath()));
        return sourceFile;
    }

    /**
     * Emits the files in the directory.
     * @param options - Options for emitting.
     */
    async emit(options: { emitOnlyDtsFiles?: boolean; outDir?: string; declarationDir?: string; } = {}) {
        const {fileSystemWrapper} = this.global;
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
        const {fileSystemWrapper} = this.global;
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
        const getStandardizedPath = (path: string | undefined) => path == null ? undefined : this.global.fileSystemWrapper.getStandardizedAbsolutePath(path, this.getPath());
        const getSubDirPath = (path: string | undefined, dir: Directory) => path == null ? undefined : FileUtils.pathJoin(path, dir.getBaseName());
        const hasDeclarationDir = this.global.compilerOptions.declarationDir != null || options.declarationDir != null;

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
    copy(relativeOrAbsolutePath: string, options: { overwrite?: boolean; } = {}) {
        const newPath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(relativeOrAbsolutePath, this.getPath());
        const directory = this.global.compilerFactory.createOrAddDirectoryIfNotExists(newPath);

        for (const sourceFile of this.getSourceFiles())
            sourceFile.copy(FileUtils.pathJoin(newPath, sourceFile.getBaseName()), options);
        for (const childDir of this.getDirectories())
            childDir.copy(FileUtils.pathJoin(newPath, childDir.getBaseName()), options);

        return directory;
    }

    /**
     * Queues a deletion of the directory to the file system.
     *
     * The directory will be deleted when calling ast.save(). If you wish to delete the file immediately, then use deleteImmediately().
     */
    delete() {
        const {fileSystemWrapper} = this.global;
        const path = this.getPath();
        for (const sourceFile of this.getSourceFiles())
            sourceFile.delete();
        for (const dir of this.getDirectories())
            dir.delete();
        fileSystemWrapper.queueDelete(path);
        this.remove();
    }

    /**
     * Asyncronously deletes the directory and all its descendants from the file system.
     */
    async deleteImmediately() {
        const {fileSystemWrapper} = this.global;
        const path = this.getPath();
        this.remove();
        await fileSystemWrapper.deleteImmediately(path);
    }

    /**
     * Synchronously deletes the directory and all its descendants from the file system.
     */
    deleteImmediatelySync() {
        const {fileSystemWrapper} = this.global;
        const path = this.getPath();
        this.remove();
        fileSystemWrapper.deleteImmediatelySync(path);
    }

    /**
     * Removes the directory and all its descendants from the AST.
     *
     * Note: Does not delete the directory from the file system.
     */
    remove() {
        for (const sourceFile of this._sourceFiles)
            sourceFile.forget();

        for (const dir of this._directories)
            dir.remove();

        this.global.compilerFactory.removeDirectoryFromCache(this);
        if (this._parent != null)
            this._parent._removeDirectory(this);
        this._global = undefined;
    }

    /**
     * Asynchronously saves the directory and all the unsaved source files to the disk.
     */
    async save() {
        await FileUtils.ensureDirectoryExists(this.global.fileSystemWrapper, this.getPath());
        const unsavedSourceFiles = this.getSourceFiles().filter(s => !s.isSaved());
        await Promise.all(unsavedSourceFiles.map(s => s.save()));
        await Promise.all(this.getDirectories().map(d => d.save()));
    }

    /**
     * Synchronously saves the directory and all the unsaved source files to the disk.
     */
    saveSync() {
        FileUtils.ensureDirectoryExistsSync(this.global.fileSystemWrapper, this.getPath());
        const unsavedSourceFiles = this.getSourceFiles().filter(s => !s.isSaved());
        unsavedSourceFiles.forEach(s => s.saveSync());
        this.getDirectories().map(d => d.saveSync());
    }

    /** @internal */
    _addSourceFile(sourceFile: SourceFile) {
        const baseName = sourceFile.getBaseName().toUpperCase();
        ArrayUtils.binaryInsert(this._sourceFiles, sourceFile, item => item.getBaseName().toUpperCase() > baseName);
    }

    /** @internal */
    _removeSourceFile(filePath: string) {
        for (let i = 0; i < this._sourceFiles.length; i++) {
            if (this._sourceFiles[i].getFilePath() === filePath) {
                this._sourceFiles.splice(i, 1);
                break;
            }
        }
    }

    /** @internal */
    _addDirectory(dir: Directory) {
        const baseName = dir.getBaseName().toUpperCase();
        ArrayUtils.binaryInsert(this._directories, dir, item => item.getBaseName().toUpperCase() > baseName);
        dir._parent = this;
    }

    /** @internal */
    _wasRemoved() {
        return this._global == null;
    }

    /** @internal */
    private _removeDirectory(dir: Directory) {
        const index = this._directories.indexOf(dir);
        if (index >= 0)
            this._directories.splice(index, 1);
    }

    private throwIfDeletedOrRemoved() {
        if (this._wasRemoved())
            throw new errors.InvalidOperationError("Cannot use a directory that was deleted or removed.");
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
