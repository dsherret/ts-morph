import {SourceFile} from "./../compiler";
import * as errors from "./../errors";
import {ArrayUtils, FileUtils} from "./../utils";
import {SourceFileStructure} from "./../structures";
import {GlobalContainer} from "./../GlobalContainer";

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
     * Gets a child directory with the specified name or throws if not found.
     * @param dirName - Directory name.
     */
    getDirectoryOrThrow(dirName: string): Directory;
    /**
     * Gets a child directory by the specified condition or throws if not found.
     * @param condition - Condition to check the directory with.
     */
    getDirectoryOrThrow(condition: (directory: Directory) => boolean): Directory;
    getDirectoryOrThrow(dirNameOrCondition: string | ((directory: Directory) => boolean)) {
        return errors.throwIfNullOrUndefined(this.getDirectory(dirNameOrCondition), () => {
            if (typeof dirNameOrCondition === "string")
                return `Could not find child directory with name '${dirNameOrCondition}'.`;
            return "Could not find child directory that matched condition.";
        });
    }

    /**
     * Gets a child directory with the specified name or undefined if not found.
     * @param dirName - Directory name.
     */
    getDirectory(dirName: string): Directory | undefined;
    /**
     * Gets a child directory by the specified condition or undefined if not found.
     * @param condition - Condition to check the directory with.
     */
    getDirectory(condition: (directory: Directory) => boolean): Directory | undefined;
    /** @internal */
    getDirectory(dirNameOrCondition: string | ((directory: Directory) => boolean)): Directory | undefined;
    getDirectory(dirNameOrCondition: string | ((directory: Directory) => boolean)) {
        if (typeof dirNameOrCondition === "string") {
            const name = dirNameOrCondition;
            dirNameOrCondition = directory => FileUtils.getBaseName(directory.getPath()) === name;
        }

        return ArrayUtils.find(this.getDirectories(), dirNameOrCondition);
    }

    /**
     * Gets a child source file with the specified name or throws if not found.
     * @param fileName - File name.
     */
    getSourceFileOrThrow(fileName: string): SourceFile;
    /**
     * Gets a child source file by the specified condition or throws if not found.
     * @param condition - Condition to check the source file with.
     */
    getSourceFileOrThrow(condition: (sourceFile: SourceFile) => boolean): SourceFile;
    /** @internal */
    getSourceFileOrThrow(fileNameOrCondition: string | ((sourceFile: SourceFile) => boolean)): SourceFile;
    getSourceFileOrThrow(fileNameOrCondition: string | ((sourceFile: SourceFile) => boolean)) {
        return errors.throwIfNullOrUndefined(this.getSourceFile(fileNameOrCondition), () => {
            if (typeof fileNameOrCondition === "string")
                return `Could not find child source file with name '${fileNameOrCondition}'.`;
            return "Could not find child source file that matched condition.";
        });
    }

    /**
     * Gets a child source file with the specified name or undefined if not found.
     * @param fileName - File name.
     */
    getSourceFile(fileName: string): SourceFile | undefined;
    /**
     * Gets a child source file by the specified condition or undefined if not found.
     * @param condition - Condition to check the source file with.
     */
    getSourceFile(condition: (sourceFile: SourceFile) => boolean): SourceFile | undefined;
    /** @internal */
    getSourceFile(fileNameOrCondition: string | ((sourceFile: SourceFile) => boolean)): SourceFile | undefined;
    getSourceFile(fileNameOrCondition: string | ((sourceFile: SourceFile) => boolean)) {
        if (typeof fileNameOrCondition === "string") {
            const name = fileNameOrCondition;
            fileNameOrCondition = sourceFile => FileUtils.getBaseName(sourceFile.getFilePath()) === name;
        }

        return ArrayUtils.find(this.getSourceFiles(), fileNameOrCondition);
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
     * Adds an existing directory to the AST from the relative path or directory name.
     *
     * Will return the directory if it was already added.
     * @param path - Directory name or path to the directory that should be added.
     */
    addExistingDirectory(path: string) {
        const dirPath = FileUtils.getStandardizedAbsolutePath(path, this.getPath());
        if (!this.global.fileSystem.directoryExistsSync(dirPath))
            throw new errors.DirectoryNotFoundError(dirPath);
        return this.global.compilerFactory.addDirectoryIfNotExists(dirPath);
    }

    /**
     * Creates a directory if it doesn't exist.
     * @param path - Directory name or path to the directory that should be created.
     */
    createDirectory(path: string) {
        const dirPath = FileUtils.getStandardizedAbsolutePath(path, this.getPath());
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
        const filePath = FileUtils.getStandardizedAbsolutePath(FileUtils.pathJoin(this.getPath(), relativeFilePath));
        return this.global.compilerFactory.createSourceFile(filePath, structureOrText);
    }

    /**
     * Adds an existing source file to the AST, relative to this directory.
     *
     * Will return the source file if it was already added.
     * @param relativeFilePath - Relative file path to add.
     */
    addExistingSourceFile(relativeFilePath: string) {
        const filePath = FileUtils.getStandardizedAbsolutePath(FileUtils.pathJoin(this.getPath(), relativeFilePath));
        if (!this.global.fileSystem.fileExistsSync(filePath))
            throw new errors.FileNotFoundError(filePath);
        return this.global.compilerFactory.getSourceFileFromFilePath(filePath)!;
    }

    /**
     * Copies a directory to a new directory.
     * @param relativeOrAbsolutePath - The relative or absolute path to the new directory. Path is relative to the parent directory.
     * @returns The directory the copy was made to.
     */
    copy(relativeOrAbsolutePath: string) {
        const newPath = FileUtils.getStandardizedAbsolutePath(relativeOrAbsolutePath, FileUtils.getDirPath(this.getPath()));
        const directory = this.global.compilerFactory.getOrCreateDirectory(newPath);

        for (const sourceFile of this.getSourceFiles())
            sourceFile.copy(FileUtils.pathJoin(newPath, sourceFile.getBaseName()));
        for (const childDir of this.getDirectories())
            childDir.copy(FileUtils.pathJoin(newPath, childDir.getBaseName()));

        return directory;
    }

    /**
     * Asyncronously deletes the directory and all its descendants.
     *
     * WARNING: This will delete the directory from the file system.
     */
    async delete() {
        const fileSystem = this.global.fileSystem;
        const path = this.getPath();
        this.remove();
        await fileSystem.delete(path);
    }

    /**
     * Synchronously deletes the directory and all its descendants.
     *
     * WARNING: This will delete the directory from the file system.
     */
    deleteSync() {
        const fileSystem = this.global.fileSystem;
        const path = this.getPath();
        this.remove();
        fileSystem.deleteSync(path);
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
